const Sequelize = require('sequelize')

const model = {
	name: 'vehicle',
	define: {
		vin: {
			type: Sequelize.STRING,
			allowNull: false,
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
	model
}