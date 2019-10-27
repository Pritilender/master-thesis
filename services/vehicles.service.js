'use strict'
const DbService = require('moleculer-db')
const SqlAdapter = require('moleculer-db-adapter-sequelize')
const Sequelize = require('sequelize')

const adapter = new SqlAdapter('vehicles', '', '', {
	host: 'localhost',
	dialect: 'postgres',
})

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
	started() {
		this.model.sync({force: true})
	}
}