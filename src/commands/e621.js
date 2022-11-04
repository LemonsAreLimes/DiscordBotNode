const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
var https = require('https')
const fs = require('fs')

const { file_locations } = require('../config.json')
const command_log = require('./logTemp/command_log.json')

class e621 {

    constructor(){}
    async search(ctx){

        //get the inputs
        const tags = ctx.options.getString('tags')
        const path = '/posts.json?tags='+ tags.replace(/ /g, '+')

        const options = {
            hostname: 'e621.net',
            path: path,
            method: 'GET',
            headers: {'User-Agent': 'roboAPI/1.0 robocough'}
          };

        https.get(options, (res) => {
        
            let data = ''
            res.on('data', (chunk) => { data += chunk });
            
            res.on('end', async () => {

                //parse out the images
                let post_list = JSON.parse(data).posts
                let images = []
                for (let post in post_list){ 
                    if (post_list[post].file.url != null){
                        images.push(post_list[post].file.url) 
                    }
                }

                //save all image links to command log
                let id = Math.round(Math.random() * 1000000)
                const new_command_data = {
                    "id":id,
                    "currentImage":0,
                    "data":{
                        "images":images
                    }
                }

                //add to the log file
                command_log.log.push(new_command_data)
                fs.writeFileSync(file_locations.nsfwCmdLog, JSON.stringify(command_log), (a, b)=>{ console.log(a + b) })

                //create embed
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('e621 ;)')
                    .setImage(images[0])
                    .addFields({ name: 'request id', value: String(id), inline: true })

                //create the buttons
                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('prev')
                    .setStyle(ButtonStyle.Primary)
                ).addComponents(
                    new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('next')
                    .setStyle(ButtonStyle.Primary)
                )

                //send buttons and embed
                await ctx.reply({ embeds:[embed], components: [buttons]})


            });
        });
    }

}

module.exports = { e621 }