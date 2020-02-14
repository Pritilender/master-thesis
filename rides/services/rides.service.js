'use strict'
const DbService = require('moleculer-db')
const SqlAdapter = require('moleculer-db-adapter-sequelize')
const Sequelize = require('sequelize')
const { MoleculerError } = require("moleculer").Errors;

const { DB_USER, DB_PASSWORD, DB_HOST } = process.env
const adapter = new SqlAdapter('rides', DB_USER, DB_PASSWORD, { host: DB_HOST, dialect: 'postgres' })

const model = {
	name: 'ride',
	define: {
		startedAt: {
			type: Sequelize.DATE,
		},
		endedAt: {
			type: Sequelize.DATE,
		},
		startLocation: {
			type: Sequelize.JSONB,
			allowNull: false,
		},
		endLocation: {
			type: Sequelize.JSONB,
			allowNull: false,
		},
		passengerCount: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				min: 1,
			}
		},
		vehicleId: {
			type: Sequelize.INTEGER,
			allowNull: false,
		},
		status: {
			type: Sequelize.STRING,
			allowNull: false,
		}
	},
	options: {
		timestamps: true,
		version: true,
		underscored: true,
	}
}

module.exports = {
	name: 'rides',
	mixins: [DbService],
	adapter,
	model,
	async started() {
		if (process.env.SYNC != 'true') return

		await this.model.sync({force: true})
	},
	actions: {
		async startRide(ctx) {
			const availableVehicles = await this.broker.call('vehicles.availableVehicles', { seatCount: ctx.params.passengerCount })
			if (availableVehicles.length == 0) throw new MoleculerError(`There are no available vehicles right now.`, 400, 'NO_AVAILABLE_VEHICLES')

			const vehicle = await this.closestVehicleId(availableVehicles, ctx.params.startLocation)
			
			await this.broker.call('vehicles.update', { id: vehicle.id, availability: false })
			try {
				const booking = await this.actions.create({ vehicleId: vehicle.id, startedAt: Date.now(), status: 'started', ...ctx.params })
				return booking
			} catch (e) {
				await this.broker.call('vehicles.update', { id: vehicle.id, availability: true })
				throw new MoleculerError(`Ride can't be started. Reason: ${e.message}`, 400, 'RIDE_NOT_STARTED')
			}
		},
		async endRide(ctx) {
			const ride = (await this.actions.find({ query: { id: ctx.params.rideId, status: 'started' } }))[0]
			if (!ride) throw new MoleculerError(`Ride with ID ${ctx.params.id} in started state is not found.`, 404, `RIDE_NOT_FOUND`)

			await this.actions.update({ id: ctx.params.rideId, endedAt: Date.now(), status: 'ended' })
			await this.broker.call('vehicles.update', { id: ride.vehicleId, availability: true })
		}
	},
	methods: {
		async closestVehicleId(vehicles, { lat, lng }) {
			const vehicleLastLocations = await Promise.all(vehicles.map(v => this.broker.call('telematics.lastMessage', { vehicleId: v.id})))
			
			const { closestId } = vehicleLastLocations.reduce(({ closestId, distance }, { parsed: message, vehicleId }) => {
				const [vehicleLng, vehicleLat] = message.location.coordinates
				const currentDistance = Math.sqrt((lat - vehicleLat) ** 2 + (lng - vehicleLng) ** 2)
				return distance > currentDistance ? { closestId: vehicleId, distance: currentDistance } : { closestId, distance }
			}, { closestId: null, distance: Infinity })

			return vehicles.find(v => v.id == closestId)
		}
	}
}