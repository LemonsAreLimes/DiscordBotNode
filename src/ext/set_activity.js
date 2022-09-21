const DiscordRPC = require('discord-rpc')
const { clientId } = require('../config.json')

//create the rich presnse thing
const rpc = new DiscordRPC.Client({transport: 'ipc'})
DiscordRPC.register(clientId)

rpc.on('ready', async () => {
    rpc.setActivity(
        {
        state: "Cores in use: ",
        details: "Simulating all of human history",
        startTimestamp: 10000,
        largeImageKey: "lovecraft-3185550458",
        largeImageText: "THY GAZE UPON THE",
        partyId: "ae488379-351d-4a4f-ad32-2b9b01c91657",
        partySize: 64,
        partyMax: 2048,
        joinSecret: "MTI4NzM0OjFpMmhuZToxMjMxMjM= ",
    })

    console.log('set activity')
})

rpc.login({ clientId }).catch( err => {console.log(err)})
