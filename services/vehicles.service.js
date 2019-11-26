'use strict'
const DbService = require('moleculer-db')
const SqlAdapter = require('moleculer-db-adapter-sequelize')
const Sequelize = require('sequelize')

const adapter = new SqlAdapter('vehicles', '', '', {
	host: 'localhost',
	dialect: 'postgres',
})

const randomItem = (items) => items[Math.floor(Math.random() * items.length)]

const vehicleFactory = () => {
	const brands = ['BMW', 'Toyota', 'Hyundai', 'Mercedes', 'Ford', 'Segway']
	const models = ['X1', 'X2', 'Accord', 'Corola', '500', 'CL', 'Tucson', 'i30', 'M520', '123']
	const fuelTypes = ['electric', 'hybrid', 'euro 6', 'gasolin']
	const type = ['scooter', 'car', 'car', 'car']
	
	const vehicle = {
		name: randomItem(brands) + ' ' + randomItem(models),
		type: randomItem(type),
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
		location: Sequelize.JSONB,
		fuelLevel: {
			type: Sequelize.SMALLINT,
			allowNull: false,
			defaultValue: 50,
			validate: {
				min: 0,
				max: 100,
			},
		},
		fuelType: {
			type: Sequelize.STRING,
			allowNUll: false,
		},
		type: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		totalDistance: {
			type: Sequelize.INTEGER,
			allowNull: false,
			defaultValue: 0,
			validate: {
				min: 0,
			}
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