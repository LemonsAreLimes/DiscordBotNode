const { createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus  } = require('@discordjs/voice');
const { QueryType } = require("discord-player")
const ytdl = require('ytdl-core')
const fs = require('fs')

class musicCommands {

    constructor(){

        this.id = ''
        this.queue = []
        this.playing = false
        this.paused = false
        this.audio_player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
        
        this.audio_player.on(AudioPlayerStatus.Idle, (x, y) => {
            this.playing = false

            console.log('event called!')

            //check if the queue is empty
            if( this.queue[0] ){

                //play the first element then remove the first element
                this.play(this.queue[0])
                this.queue.pop(0)
    
                console.log(this.queue)    

            } else {
                console.log('the queue is empty')
            }

        });


    }

    init(ctx){
        this.id = ctx.guild.id
        return this.audio_player
    }

    //searches youtube for query
    async search(player, ctx){

        const query = ctx.options.getString("name")

        //search the audio on yt
        const result = await player.search(query, {
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

    //downloads and plays output from search
    async play(song_obj){
        this.playing = true

        //download the audio
        const audio_id = Math.round(Math.random() * 1000000)
        ytdl(song_obj.url, { filter: "audioonly", format: "mp3" } )
            .pipe(fs.createWriteStream(`C:/Users/USER/visual_studio_code/JAVASCRIPT/DiscordBot/src/commands/audioTemp/${audio_id}.mp3`))
            .on('finish', () => { 

                //when done downloading, play the audio
                let resource = createAudioResource(`C:/Users/USER/visual_studio_code/JAVASCRIPT/DiscordBot/src/commands/audioTemp/${audio_id}.mp3`, { inlineVolume: true })
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
}

module.exports = { musicCommands } 