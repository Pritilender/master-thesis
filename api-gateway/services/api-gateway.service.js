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
					'POST message': 'vehicleCommunicator.decode',
					'POST action': 'vehicleCommunicator.executeAction',
					'GET vehicle-messages': 'vehicleCommunicator.list',
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
