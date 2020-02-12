'use strict'
const DbService = require('moleculer-db')
const SqlAdapter = require('moleculer-db-adapter-sequelize')
const Sequelize = require('sequelize')
const exampleVehicles = require('../seeds/vehicles.json')

const { DB_USER, DB_PASSWORD, DB_HOST } = process.env
const adapter = new SqlAdapter('vehicles', DB_USER, DB_PASSWORD, { host: DB_HOST, dialect: 'postgres' })

const model = {
	name: 'vehicle',
	define: {
		vin: {
			type: Sequelize.STRING,
			alloowNull: false,
			unique: true,
		},
		make: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		model: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		type: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		seatCount: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				min: 1
			}
		},
		fuelType: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		licensePlate: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		fuelLevel: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
				max: 100,
			},
		},
		location: Sequelize.JSONB,   
		totalDistance: {
			type: Sequelize.BIGINT,
			allowNull: false,
			defaultValue: 0,
		},
		totalPassangerCount: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		totalRides: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0
		},
		availability: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		alert: {
			type: Sequelize.STRING,
			allowNull: true,
		}
	},
	options: {
		timestamps: true,
		version: true,
		underscored: true,
	}
}

module.exports = {
	name: 'vehicles',
	mixins: [DbService],
	adapter,
	model,
	async started() {
		if (process.env.SYNC != 'true') return

		await this.model.sync({force: true})
		
		for (const vehicle of exampleVehicles) {
			await this.model.create(vehicle)
		}
	}
}