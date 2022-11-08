const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, underscore } = require('discord.js')
const { exec } = require("child_process");
const fs = require('fs')
const https = require('https')

const { file_locations } = require('../config.json')
const voiceList = require('./ext/uberduckVoices.json')

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

class uberduck {

    constructor(){
        this.voice_uuid = "af6e7f9f-4d46-4952-b024-81c34a20fc59"
    }

    async searchVoice(ctx){

        //get the value of whatevers in the search
        const voiceQuery = ctx.options.getString('voice')

        //query the catogory list and get relivant results
        let response = []
        for( let i in voiceList ){

            //check if the list is too big
            if( response.length == 25 ){break}

            //if the list isnt too big, add it 
            const curr_voice = voiceList[i]
            if( curr_voice.name.toUpperCase().includes(voiceQuery.toUpperCase()) ){
                response.push(curr_voice)
            } 


        }

        //send it off and hope it just works
        await ctx.respond(response)
    }

    async send(ctx, link){

        //define the download directory
        const downloadDir = file_locations.uberduckTempFolder
        const audio_id =  Math.round(Math.random() * 1000000)
        
        //download the audio
        https.get(link,(res) => {
            const filePath = fs.createWriteStream(`${downloadDir}/${audio_id}.wav`);
            
            res.pipe(filePath);
            filePath.on('finish',() => {
                filePath.close();
                
                //convert it to mp3
                exec(`ffmpeg -i ${downloadDir+'/'+audio_id}.wav ${downloadDir+'/'+audio_id}.mp3`, (a,b,c) => {
                    
                    //delete the old file
                    fs.unlinkSync(downloadDir+'/'+audio_id+'.wav')
                    
                    //send the new .mp3 file as an attachment
                    ctx.editReply({ files: [{
                        attachment: downloadDir+'/'+audio_id+'.mp3',
                        name: 'uberduck.mp3'
                    }]});
                })
            })
        })
    }

    async generateSpeech(ctx){
        
        //check if there is a voice chosen
        let query
        if( ctx.options.getString('voice') != null ){
            query = "'" + ctx.options.getString('voice') + "' ,'" + ctx.options.getString('text') + "'"
        } else {
            query = "'" + this.voice_uuid + "' ,'" + ctx.options.getString('text') + "'"
        }
        
        //make the inital reques
        exec(`python -c "import uberduck; uberduck.generateSpeech(${query})"`, async (a, data, b) =>{

            let ran = false

            //checks multiple times
            for( let i in [3000,5000,5000,5000,10000] ){

                //check if it already sent the stuff
                if( ran==true ){return}

                //let the epic ai think for a couple secconds 
                const sleepTime = [3000,5000,5000,5000,10000][i]
                await sleep(sleepTime)
            
                //check its status, gets a link to the audio
                exec(`python -c "import uberduck; uberduck.checkStatus('${data.replace("\r\n", "")}')"`, async (x, link, y)=> {
                
                    //dont run the download if there is no link
                    if( link == null || link == '' || link == 'None' || link == 'None\r\n'){return}
                    else{ this.send(ctx, link); ran = true }

                });
    
            }

        });
    }



}




module.exports = { uberduck }