const { EmbedBuilder, AttachmentBuilder } = require('discord.js')
const { file_locations, keys } = require('../config.json')
const http = require('http');
const fs = require('fs')
const voices = require('./ext/uberduckVoices.json')


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class uberduck {

    constructor(){
        this.gen_res = null
        this.audio_link = null
        this.speech_link = null
        this.token = null
    }

    async get_token(){

        console.log('get token call')

        //read the conf file and set the refresh
        let conf_data = fs.readFileSync(keys.uberduckConfig, {encoding: 'utf8', flag: 'r'})
        let prev_refresh = await JSON.parse(conf_data).refresh

        let res = await fetch("https://auth.uberduck.ai/api/v1/refresh_token", { method: "GET", credentials: 'include', headers: { "Cookie": prev_refresh } })

        //get refresh token
        if( res.status == 401 ){console.log("GET NEW REFRESH TOKEN"); return }
        let refresh_token = res.headers.get('set-cookie').split(";")[0]

        //get acsess token
        let body = await res.json()
        let token = body.access_token
        this.token = token

        //write the refresh token to the config file
        fs.writeFileSync(keys.uberduckConfig, JSON.stringify({ refresh: refresh_token, token: token }))
    }

    async gen_speech(text, voice, ctx){

        if( this.token == null ){ 
            this.token = JSON.parse(fs.readFileSync(keys.uberduckConfig, {encoding: 'utf8'})).token
            // await this.get_token(); console.log("this.token == null") 
        }

        const acsess_token = "Bearer " + this.token
        let res = await fetch("http://api.uberduck.ai/speak", {
            method: "POST",
            headers: { "authorization": acsess_token },
            body: JSON.stringify({"speech":text, "voice":voice, "pace":"1"})
        })
        this.gen_res = await res.json() 
        let voice_link = await this.check()
        return voice_link
    }

    async check(){
        if( this.gen_res.detail == 'Could not validate credentials' ){ await this.get_token(); console.log('credentials invalid?') } 
        else {
            console.log("starting link request")
            this.speech_link = "http://api.uberduck.ai/speak-status?uuid="+this.gen_res.uuid
            let voice_link = await this.req_speech_status()
            return voice_link
        }
    } 

    async req_speech_status(){
        while( this.audio_link == null ) {
            console.log("requesting speech status")
            await sleep(1000)
            let res = await fetch(this.speech_link, {method: "GET"})
            let json = await res.json()

            console.log(json)

            if( json.path != null ){
                console.log(json.path)
                return json.path
            }
            
        }
    }
    
    search_voices(query){
        let found_voices = []
        for( let i in voices ){
            if( found_voices.length == 24 ){ break }
            let voice_hit = voices[i].display_name.toUpperCase().includes(query.toUpperCase())
            let catogory_hit = voices[i].category.toUpperCase().includes(query.toUpperCase())
            
            let display_name = voices[i].display_name
            let uberduck_name = voices[i].name
            if( voice_hit || catogory_hit ){ found_voices.push({ "name": display_name, "value": uberduck_name})}
        }
        return found_voices
    }

    async send_response(text, voice, url_https, ctx){

        try { 
            let url = url_https.replace("https", "http") 

            let file = fs.createWriteStream(file_locations.audioTempFolder+"uberDuckAudio.wav")
            let req = http.get(url, (stream) => {
                stream.pipe(file)
            
                req.on("close", async () => {
                    let embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle("uberDuck: " + voice)
                        .setDescription(text)
        
                    let attachments = new AttachmentBuilder(file_locations.audioTempFolder+"uberDuckAudio.wav")
                    await ctx.editReply({ embeds: [embed], files: [attachments] })
                
                })
        
            })
            
        }
        catch { await ctx.editReply({ content: "yeah so something went wrong here" }) }
        

    }

}

module.exports = { uberduck }