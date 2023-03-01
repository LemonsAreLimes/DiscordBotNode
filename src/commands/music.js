const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const { QueryType, Player } = require("discord-player")
const ytdl = require('ytdl-core')
const fs = require('fs')

const { file_locations, useRandomAudio } = require('../config.json') 
const { guilds } = require('../guilds.json')


//define the sleep function
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

class musicCommands {

    constructor(client){

        this.id = ''
        this.queue = []
        this.playing = false
        this.paused = false
        this.client = client
        this.audio_player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        this.player = new Player(client, { ytdlOptions: { quality: "highestaudio" } })
        this.connection = {}

        this.player.on('botDisconnect', () => {
            this.id = null
            console.log('removing player...')
        });

        this.audio_player.on(AudioPlayerStatus.Idle, async (x, y) => {
            this.playing = false

            //check if the queue is empty
            if( this.queue[0] ){

                console.log('the queue is not empty')

                //play the first element then remove the first element
                this.play(this.queue[0])
                this.queue.pop(0)
    
                console.log(this.queue)    

            } else {
                console.log('the queue is empty');

                //check if this feature is enabled
                if( !useRandomAudio ){ return } 

                //when nothing is playing, set a random timeout
                const timeoutMultiplier = 100;
                const timeout = Math.floor(Math.random() * 1000) * timeoutMultiplier;
                await sleep(timeout);
                
                //select an audio from the random audio folder
                let audio_list = fs.readdirSync(file_locations.randomAudio)
                let selected_index = Math.floor(Math.random() * audio_list.length)
                let selected =  file_locations.randomAudio+audio_list[selected_index]

                // play it
                let resource = createAudioResource(selected, { inlineVolume: true })
                resource.volume.setVolume(1)
                this.audio_player.play(resource)

            }
        });
    }

    init(ctx){
        this.id = ctx.guild.id
        return this.audio_player
    }

    //searches youtube for query
    async search(ctx){

        const query = ctx.options.getString("name")

        //search the audio on yt
        const result = await this.player.search(query, {
            requestedBy: ctx.user,
            searchEngine: QueryType.AUTO
        })

        //parse out the requred data points
        const song_data = {
            'title':result.tracks[0].title,
            'duration':result.tracks[0].duration,
            'url':result.tracks[0].url
        }

        return song_data

    }

    async connect(ctx){

        this.connection = joinVoiceChannel({
            channelId: ctx.member.voice.channelId,
            guildId: ctx.guild.id,
            adapterCreator: ctx.guild.voiceAdapterCreator,
        });

        this.connection.subscribe(this.audio_player);

    }

    //downloads and plays output from search
    async play(song_obj){
        this.playing = true

        //download the audio
        const audio_id = Math.round(Math.random() * 1000000)
        ytdl(song_obj.url, { filter: "audioonly", format: "mp3" } )
            .pipe(fs.createWriteStream(file_locations.audioTempFolder+`${audio_id}.mp3`))
            .on('finish', () => { 

                //when done downloading, play the audio
                let resource = createAudioResource(file_locations.audioTempFolder+`${audio_id}.mp3`, { inlineVolume: true })
                resource.volume.setVolume(1)
                this.audio_player.play(resource)
        });

    }

    pause(){

        if( this.paused ){
            this.audio_player.unpause()
            this.paused = false
        } else {
            this.audio_player.pause()
            this.paused = true
        }

    }

    disconnect(){

        this.connection.destroy()

    }

}

module.exports = { musicCommands } 