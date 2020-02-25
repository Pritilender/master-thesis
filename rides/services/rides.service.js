'use strict'
const DbService = require('moleculer-db')
const SqlAdapter = require('moleculer-db-adapter-sequelize')
const { model } = require('../models/ride.model')
const { MoleculerError } = require('moleculer').Errors
const ApiService = require('moleculer-web')

const { DB_USER, DB_PASSWORD, DB_HOST } = process.env
const adapter = new SqlAdapter('rides', DB_USER, DB_PASSWORD, { host: DB_HOST, dialect: 'postgres', logging: false })

module.exports = {
	name: 'rides',
	mixins: [DbService, ApiService],
	adapter,
	model,
	async started() {
		if (process.env.SYNC != 'true') return
		await this.model.sync({force: true})
	},
	actions: {
		async startRide({ params }) {
			const availableVehicles = await this.broker.call('vehicles.availableVehicles', { seatCount: params.passengerCount })
			if (availableVehicles.length == 0) throw new MoleculerError('There are no available vehicles right now.', 400, 'NO_AVAILABLE_VEHICLES')

			const vehicle = await this.closestVehicle(availableVehicles, params.startLocation)
			
			await this.broker.call('vehicles.bookVehicle', { id: vehicle.id })
			try {
				const booking = await this.actions.create({ vehicleId: vehicle.id, startedAt: Date.now(), status: 'started', ...params })
				return booking
			} catch (e) {
				await this.broker.call('vehicles.releaseVehicle', { id: vehicle.id })
				throw new MoleculerError(`Ride can't be started. Reason: ${e.message}`, 400, 'RIDE_NOT_STARTED')
			}
		},
		async endRide({ params }) {
			const ride = (await this.actions.find({ query: { id: params.rideId, status: 'started' } }))[0]
			if (!ride) throw new MoleculerError(`Ride with ID ${params.id} in started state is not found.`, 404, 'RIDE_NOT_FOUND')

			await this.actions.update({ id: params.rideId, endedAt: Date.now(), status: 'ended' })
			await this.broker.call('vehicles.releaseVehicle', { id: ride.vehicleId })
		},
		async health({ params }) {
			await this.actions.list({ pageSize: 1})
		}
	},
	methods: {
		async closestVehicle(vehicles, { lat, lng }) {
			const vehicleLastLocations = await Promise.all(vehicles.map(v => this.broker.call('telematics.lastMessage', { vehicleId: v.id})))
			
			const { closestId } = vehicleLastLocations.filter(x => x != null)
				.reduce(({ closestId, distance }, { parsed: message, vehicleId }) => {
					const [vehicleLng, vehicleLat] = message.location.coordinates
					const currentDistance = Math.sqrt((lat - vehicleLat) ** 2 + (lng - vehicleLng) ** 2)
					return distance > currentDistance ? { closestId: vehicleId, distance: currentDistance } : { closestId, distance }
				}, { closestId: null, distance: Infinity })

			return vehicles.find(v => v.id == closestId)
		}
	},
	// Health Check
	settings: {
		port: process.env.PORT || 8888,
		routes: [
			{
				path: '/rides',
				aliases: {
					'GET health': 'rides.health'
				}
			},
		],
	}
}