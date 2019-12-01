'use strict'
const fetch = require('node-fetch')
const baseUrl = 'http://localhost:3000/api'

const round = (num) => Number(num.toFixed(5))
const randomNumber = (min, max) => round(Math.random() * (max - min + 1) + min)
const sleep = async (seconds) => new Promise((resolve) => setTimeout(() => resolve(), seconds * 1000))

;(async function() {
	const vehiclesResponse = await fetch(`${baseUrl}/vehicles?pageSize=35`)
	const vehicles = await vehiclesResponse.json()
    
	const vehicleLocationMap = new Map()

	for (const vehicle of vehicles.rows) {
		const lat = randomNumber(42, 46)
		const lng = randomNumber(18, 21)
		const odometer = Math.floor(randomNumber(250000, 300000))
		const fuelLevel = Math.floor(randomNumber(30, 70))
        
		vehicleLocationMap.set(vehicle.id, { lat, lng, odometer, fuelLevel, externalId: vehicle.externalId })
	}
    
	// eslint-disable-next-line no-constant-condition
	while(true) {
		for (const [id, data] of vehicleLocationMap) {
			await fetch(`${baseUrl}/message`, { 
				method: 'POST', 
				// todo: cover all message formats
				body: JSON.stringify({
					id: data.externalId, 
					lat: data.lat, 
					lng: data.lng, 
					batteryPercentage: data.fuelLevel, 
					distanceTravelled: data.odometer
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			})
            
			vehicleLocationMap.set(id, { 
				...data, 
				lat: round(data.lat + 0.00001), 
				lng: round(data.lng + 0.00001), 
				odometer: data.odometer + 10, 
				fuelLevel: data.fuelLevel > 10 ? data.fuelLevel - 1 : 85 
			})
		}
		await sleep(5)
	}
})()