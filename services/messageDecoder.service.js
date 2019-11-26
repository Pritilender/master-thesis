'use strict'

module.exports = {
	name: 'messageDecoder',

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Decode a message to default format for DB.
		 * 
		 * Message can come in 3 different formats:
		 * 
		 * 1. { id: string, location: { lat: number, lng: number } }
		 * 2. { id: string, lat: number, lng: number }
		 * 3. { vin: string, location: [number, number] }
		 */
		async decode(ctx) {
			const message = this.parseMessage(ctx.params)
			const vehicle = await this.findVehicle(message.externalId)
			await this.broker.call('vehicles.update', { id: vehicle.id, location: message.location })
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
			}
		},
		parseFormat2(message) {
			return {
				externalId: message.id,
				location: {
					lat: message.lat,
					lng: message.lng,
				},
			}
		},
		parseFormat3(message) {
			return {
				externalId: message.externalId,
				location: {
					lat: message.location[1],
					lng: message.location[0],
				},
			}
		},
		async findVehicle(externalId) {
			const vehicles = await this.broker.call('vehicles.find', { query: { externalId } })
			// todo: handle case when there's no vehicle with this external ID
			return vehicles[0]
		}
	},
}