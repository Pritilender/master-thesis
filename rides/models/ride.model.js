const Sequelize = require('sequelize')

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
	model
}