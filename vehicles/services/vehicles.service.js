'use strict'
const DbService = require('moleculer-db')
const SqlAdapter = require('moleculer-db-adapter-sequelize')
const Sequelize = require('sequelize')

const adapter = new SqlAdapter('vehicles', 'dbuser', 'super_secret', { host: 'postgres', dialect: 'postgres' })

const randomItem = (items) => items[Math.floor(Math.random() * items.length)]

const vehicleFactory = () => {
	const brands = ['BMW', 'Toyota', 'Hyundai', 'Mercedes', 'Ford', 'Segway']
	const models = ['X1', 'X2', 'Accord', 'Corola', '500', 'CL', 'Tucson', 'i30', 'M520', '123']
	const fuelTypes = ['electric', 'hybrid', 'euro 6', 'gasolin']
	const type = ['scooter', 'car', 'car', 'car']
	
	const vehicle = {
		name: randomItem(brands) + ' ' + randomItem(models),
		type: randomItem(type),
		externalId: Math.floor(Math.random() * 1000000000000 + Date.now()),
	}

	vehicle.fuelType = vehicle.type == 'scooter' ? 'electric' : randomItem(fuelTypes)

	return vehicle
}

const model = {
	name: 'vehicle',
	define: {
		name: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		externalId: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
		},
		type: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		fuelType: {
			type: Sequelize.STRING,
			allowNUll: false,
		},
		fuelLevel: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 50,
			// validate: {
			// 	min: 0,
			// 	max: 100,
			// },
		},
		location: Sequelize.JSONB,
		totalDistance: {
			type: Sequelize.BIGINT,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			}
		},
		state: {
			type: Sequelize.STRING,
			defaultValue: 'locked',
			allowNull: false,
		}
	},
	options: {
		timestamps: true,
		version: true,
		underscored: true,
		paranoid: true,
		synce: {
			force: true,
		}
	}
}

module.exports = {
	name: 'vehicles',
	mixins: [DbService],
	adapter,
	model,
	async started() {
		await this.model.sync({force: true})
		for (let i = 0; i < 50; i++) {
			await this.model.create(vehicleFactory())
		}
	}
}