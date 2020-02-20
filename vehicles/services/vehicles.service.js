'use strict'
const DbService = require('moleculer-db')
const SqlAdapter = require('moleculer-db-adapter-sequelize')
const ApiService = require('moleculer-web')
const Sequelize = require('sequelize')
const { model } = require('../models/vehicle.model')
const exampleVehicles = require('../seeds/vehicles.json')

const { DB_USER, DB_PASSWORD, DB_HOST } = process.env
const adapter = new SqlAdapter('vehicles', DB_USER, DB_PASSWORD, { host: DB_HOST, dialect: 'postgres', logging: false })

module.exports = {
	name: 'vehicles',
	mixins: [DbService, ApiService],
	adapter,
	model,
	async started() {
		if (process.env.SYNC != 'true') return

		await this.model.sync({force: true})
		
		for (const vehicle of exampleVehicles) {
			await this.model.create(vehicle)
		}
	},
	actions: {
		async findByVin({ params }) {
			return (await this.actions.find({ query: { vin: params.vin } }))[0]
		},
		availableVehicles({ params }) {
			return this.actions.find({ 
				query: { 
					availability: true, 
					seatCount: { 
						[Sequelize.Op.gte]: params.seatCount
					}
				}
			})
		},
		bookVehicle({ params }) {
			return this.actions.update({ id: params.id, availability: false })
		},
		releaseVehicle({ params }) {
			return this.actions.update({ id: params.id, availability: true })
		},
		async health({ params }) {
			await this.actions.list({ pageSize: 1})
		}
	},
	// Health Check
	settings: {
		port: process.env.PORT || 8888,
		routes: [
			{
				path: '/vehicles',
				aliases: {
					'GET health': 'vehicles.health'
				}
			},
		],
	}
}