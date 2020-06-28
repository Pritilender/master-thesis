const { spawn } = require('child_process')
const { mkdirSync } = require('fs')

const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000))
const runName = process.argv.slice(2)[0]

const runCmd = (color, command, args) => {
    const process = spawn(command, args)
    return new Promise((resolve) => {
        process.stdout.on('data', (data) => {
            console.log(color, data.toString())
        })
    
        process.stderr.on('data', (data) => {
            console.error(data.toString())
        })
    
        process.on('close', (code) => {
            console.log(color, `🏁 Done`, code)
            resolve()
        })
    })
}

const executeArtilleryScenario = (scenario, color) => runCmd(
    color,
    `artillery`,
    [`run`, `${scenario}.yml`, `-o`, `reports/${runName}/${scenario}.json`])

const main = async () => {
    await mkdirSync(`reports/${runName}`)
    const admin = executeArtilleryScenario(`admin`, `\x1b[32m`)
    await sleep(10)
    const messages = executeArtilleryScenario(`messages`, `\x1b[36m`)
    await sleep(20)
    const rides = executeArtilleryScenario(`rides`, `\x1b[34m`)
    await Promise.all([admin, messages, rides])
}

if (!runName) {
    console.error("❌ Run name not passed. Exiting")
    return 1
}

main().then(_ => console.log('🏁 All done'))