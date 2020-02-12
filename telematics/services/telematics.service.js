'use strict'
const DbService = require('moleculer-db')
const MongoDBAdapter = require('moleculer-db-adapter-mongo')

module.exports = {
	name: 'telematics',
	mixins: [DbService],
	adapter: new MongoDBAdapter(process.env.DB_URL),
	collection: 'messages',
	async afterConnected() {
		return this.adapter.collection.createIndex({ vehicleId: 1, receivedAt: -1 })
	},
	/**
	 * Actions
	 */
	actions: {
		async decode(ctx) {
			const receivedAt = Date.now()
			const message = this.parseMessage(ctx.params)
			const vehicle = await this.findVehicle(ctx.params.vin)
			const shouldUpdate = await this.shouldUpdate(vehicle.id + '', message)
			
			if (shouldUpdate) {
				await this.broker.call('vehicles.update', { id: vehicle.id, alert: this.alert(message), ...message })
			}
			
			// saving vehicleId as a string so we can use default list action for querying
			await this.actions.create({ 
				original: ctx.params, 
				parsed: message, 
				receivedAt, 
				vehicleId: '' + vehicle.id,
				updated: shouldUpdate,
				alert: this.alert(message)
			})
		},
		async listMessages(ctx) {
			const { vehicleId, query, ...rest } = ctx.params
			return this.actions.list({ query: { vehicleId }, ...rest })
		},
		async lastMessage(ctx) {
			const vehicleId = ctx.params.vehicleId
			const messages = await this.actions.find({ query: { vehicleId }, sort: '-receivedAt', limit: 1 })
			return messages[0]
		}
	},
	/**
	 * Methods
	 */
	methods: {
		parseMessage(message) {
			return {
				vin: message.vin,
				location: {
					lat: message.lat,
					lng: message.lng,
				},
				fuelLevel: message.fuelLevel,
				odometer: message.odometer,
				speed: message.speed,
			}
		},
		async isNthMessage(vehicleId, n = 5) {
			const messageCount = await this.actions.count({ query: { vehicleId } })
			return messageCount % n == 0
		},
		isSpeedOverLimit(parsedMessage) {
			return parsedMessage.speed > 60
		},
		isFuelLow(parsedMessage) {
			return parsedMessage.fuelLevel <= 20
		},
		alert(parsedMessage) {
			const alerts = []

			if(this.isSpeedOverLimit(parsedMessage)) alerts.push('over_speed_limit')
			if(this.isFuelLow(parsedMessage)) alerts.push('low_fuel')

			return alerts.join(',')
		},
		async findVehicle(vin) {
			const vehicles = await this.broker.call('vehicles.find', { query: { vin } })
			// todo: handle case when there's no vehicle with this external ID
			return vehicles[0]
		},
		async shouldUpdate(vehicleId, parsedMessage) {
			return (await this.isNthMessage(vehicleId)) || this.isSpeedOverLimit(parsedMessage) || this.isFuelLow(parsedMessage)	
		},
	},
}