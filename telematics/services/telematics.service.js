'use strict'
const DbService = require('moleculer-db')
const MongoDBAdapter = require('moleculer-db-adapter-mongo')

module.exports = {
	name: 'telematics',
	mixins: [DbService],
	adapter: new MongoDBAdapter(process.env.DB_URL),
	collection: 'messages',
	async afterConnected() {
		await this.adapter.collection.createIndex({ vehicleId: 1, receivedAt: -1 })
		await this.adapter.collection.createIndex({ location: '2dsphere' })
	},
	/**
	 * Actions
	 */
	actions: {
		async decode({ params }) {
			const receivedAt = Date.now()
			const message = this.parseMessage(params)
			const vehicle = await this.broker.call('vehicles.findByVin', { vin: params.vin })
			const shouldUpdate = await this.shouldUpdate(vehicle.id + '', message)
			
			if (shouldUpdate) {
				await this.broker.call('vehicles.update', { id: vehicle.id, alert: this.alert(message), ...message })
			}
			
			// saving vehicleId as a string so we can use default list action for querying
			await this.actions.create({ 
				original: params, 
				parsed: message, 
				receivedAt, 
				vehicleId: '' + vehicle.id,
				updated: shouldUpdate,
				alert: this.alert(message)
			})
		},
		async listMessages({ params }) {
			const { vehicleId, query: _query, ...rest } = params
			return this.actions.list({ query: { vehicleId }, ...rest })
		},
		async lastMessage({ params }) {
			const vehicleId = '' + params.vehicleId
			const messages = await this.actions.find({ query: { vehicleId }, sort: '-receivedAt', limit: 1 })
			// returning vehicleId as a number
			return { ...messages[0], vehicleId: parseInt(messages[0].vehicleId, 10) }
		},
	},
	/**
	 * Methods
	 */
	methods: {
		parseMessage(message) {
			return {
				vin: message.vin,
				location: {
					type: 'Point',
					coordinates: [message.lng, message.lat],
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
		async shouldUpdate(vehicleId, parsedMessage) {
			return (await this.isNthMessage(vehicleId)) || this.isSpeedOverLimit(parsedMessage) || this.isFuelLow(parsedMessage)	
		},
	},
}