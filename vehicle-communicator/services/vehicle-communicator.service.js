'use strict'
const DbService = require('moleculer-db')
const MongoDBAdapter = require('moleculer-db-adapter-mongo')

module.exports = {
	name: 'vehicleCommunicator',
	mixins: [DbService],
	adapter: new MongoDBAdapter('mongodb://mongodb-mongodb-replicaset-client:27017/thesis?replicaSet=rs0'),
	collection: 'messages',
	async afterConnected() {
		return this.adapter.collection.createIndex({ vehicleId: 1, receivedAt: -1 })
	},
	/**
	 * Actions
	 */
	actions: {
		/**
		 * Decode a message to default format for DB.
		 * 
		 * Also store this message to local DB.
		 * 
		 * Message can come in 3 different formats:
		 * 
		 * 1. { id: string, location: { lat: number, lng: number }, odometer: number, fuelLevel: number }
		 * 2. { id: string, lat: number, lng: number, distanceTravelled: number, batteryPercentage: number }
		 * 3. { vin: string, location: [number, number], odometer: number, fuel: number }
		 */
		async decode(ctx) {
			const receivedAt = Date.now()
			const message = this.parseMessage(ctx.params)
			const vehicle = await this.findVehicle(message.externalId)
			const shouldUpdate = await this.shouldUpdate(vehicle.id, receivedAt)
			
			if (shouldUpdate) {
				await this.broker.call('vehicles.update', { id: vehicle.id, ...message })
			}
			
			// saving vehicleId as a string so we can use default list action for querying
			await this.actions.create({ original: ctx.params, parsed: message, receivedAt, vehicleId: '' + vehicle.id, updated: shouldUpdate })
		},
		/**
		 * Execute an action on the vehicle. It's either lock or unlock the vehicle.
		 */
		async executeAction(ctx) {
			const { action, vehicleId } = ctx.params
			// const vehicle = await this.broker.call('vehicles.findById', vehicleId)
			// todo: potentially add a new service(s) that will "send" parse message back
			
			await this.broker.call('vehicles.update', { id: vehicleId, state: `${action}ed` })
			await this.actions.create({ receivedAt: Date.now(), vehicleId: vehicleId, action })
		}
	},

	/**
	 * Methods
	 */
	methods: {
		parseMessage(message) {
			if (message.id && message.location) {
				return this.parseFormat1(message)
			} else if (message.id && message.lat) {
				return this.parseFormat2(message)
			} else if (message.externalId) {
				return this.parseFormat3(message)
			} else {
				throw new Error(`Unssported message format: ${JSON.stringify(message)}`)
			}
		},
		parseFormat1(message) {
			return {
				externalId: message.id,
				location: {
					lat: message.latitude,
					lng: message.longitude,
				},
				fuelLevel: message.fuelLevel,
				totalDistance: message.odometer,
			}
		},
		parseFormat2(message) {
			return {
				externalId: message.id,
				location: {
					lat: message.lat,
					lng: message.lng,
				},
				fuelLevel: message.batteryPercentage,
				totalDistance: message.distanceTravelled,
			}
		},
		parseFormat3(message) {
			return {
				externalId: message.externalId,
				location: {
					lat: message.location[1],
					lng: message.location[0],
				},
				fuelLevel: message.fuel,
				totalDistance: message.odometer,
			}
		},
		async findVehicle(externalId) {
			const vehicles = await this.broker.call('vehicles.find', { query: { externalId } })
			// todo: handle case when there's no vehicle with this external ID
			return vehicles[0]
		},
		async lastMessageAt(vehicleId) {
			const lastMessage = await this.actions.find({ query: { vehicleId, updated: true }, sort: '-receivedAt'})

			return lastMessage.length > 0 && lastMessage[0].receivedAt
		},
		async shouldUpdate(vehicleId, currentMessageRecievedAt) {
			const lastMessageAt = (await this.lastMessageAt(vehicleId)) || 0
			console.log(currentMessageRecievedAt, lastMessageAt, currentMessageRecievedAt - lastMessageAt > 5 * 60 * 1000)
			return currentMessageRecievedAt - lastMessageAt > 5 * 60 * 1000 // more than 5 minutes ago
		}
	},
}