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
					'POST message': 'vehicleMessage.decode',
					'POST action': 'vehicleMessage.executeAction',
					'GET vehicle-messages': 'vehicleMessage.list',
				}
			},
		],

		// Serve assets from "public" folder
		assets: {
			folder: 'public'
		},
	}
}
