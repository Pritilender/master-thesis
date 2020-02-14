'use strict'

const ApiGateway = require('moleculer-web')

module.exports = {
	name: 'api',
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3000,
		routes: [
			{
				path: '/api',
				aliases: {
					'REST vehicles': 'vehicles',
					'POST vehicles/:vin/messages': 'telematics.decode',
					'GET vehicles/:vehicleId/messages': 'telematics.listMessages',
					'POST rides': 'rides.startRide',
					'PUT rides/:rideId/status': 'rides.endRide',
					'GET rides': 'rides.list',
				}
			},
		],
		// Serve assets from "public" folder
		assets: {
			folder: 'public'
		},
	},
	started() {
		this.logger.info('Listening on port', process.env.PORT)
	}
}
