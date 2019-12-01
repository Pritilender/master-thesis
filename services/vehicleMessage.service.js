'use strict'
const DbService = require('moleculer-db')
const MongoDBAdapter = require('moleculer-db-adapter-mongo')

module.exports = {
	name: 'vehicleMessage',
	mixins: [DbService],
	adapter: new MongoDBAdapter('mongodb://localhost/thesis'),
	collection: 'messages',
	/**
	 * Actions
	 */
	actions: {

		/**
		 * Decode a message to default format for DB.
		 * 
		 * Message can come in 3 different formats:
		 * 
		 * 1. { id: string, location: { lat: number, lng: number }, odometer: number, fuelLevel: number }
		 * 2. { id: string, lat: number, lng: number, distanceTravelled: number, batteryPercentage: number }
		 * 3. { vin: string, location: [number, number], odometer: number, fuel: number }
		 */
		async decode(ctx) {
			const message = this.parseMessage(ctx.params)
			const vehicle = await this.findVehicle(message.externalId)
			await this.broker.call('vehicles.update', { id: vehicle.id, ...message })
			await this.actions.create({ original: ctx.params, parsed: message, receivedAt: Date.now(), vehicleId: vehicle.id })
		},
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
		}
	},
}