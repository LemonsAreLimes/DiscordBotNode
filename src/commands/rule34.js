const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
var https = require('https');
var xmltojson = require('xml-js')
const fs = require('fs')

const { file_locations } = require('../config.json')
const command_log = require('./logTemp/command_log.json')

class rule34 {

    constructor(){}

    async search(ctx){

        //get the inputs
        const tags = ctx.options.getString('tags')
            
        //request rule34 for tags
        https.get(`https://api.rule34.xxx//index.php?page=dapi&s=post&q=index&tags=${tags}`, (res) => {
            
            //i just folowed a tutorial i dont exactly know what this does, it works tho!
            let data = ''
            res.on('data', (chunk) => {data += chunk});

            //when the response is done
            res.on('end', async () => {
            
                //parse out the response
                let post_list = xmltojson.xml2js(data).elements[0].elements

                //extract image links
                let images = []
                for (let post in post_list){ images.push(post_list[post].attributes.file_url) }  

                //save all image links to command log
                let id = Math.round(Math.random() * 1000000)
                const new_command_data = {
                    "id":id,
                    "currentImage":0,
                    "data":{
                        "images":images
                    }
                }

                //add to file
                command_log.log.push(new_command_data)
                const write_data = JSON.stringify(command_log)
                fs.writeFileSync(file_locations.nsfw_command_list_long, write_data, (a, b)=>{console.log(a + b)})

                //create embed
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rule34 ;)')
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

    async getRequest(client, ctx){

        //get message and channel id
        let msg_id = ctx.message.id
        let channel_id = ctx.channelId

        //edit the message that called the button
        client.channels.cache.get(channel_id).messages.fetch(msg_id).then( async (msg) => {

            //get id of embed
            let id = ctx.message.embeds[0].data.fields[0].value

            //query the command history file for next / prev image
            let new_image = ''

            for( let entry in command_log.log ){
                if( command_log.log[entry].id == String(id) ){
                    if( ctx.customId == "prev" ){ command_log.log[entry].currentImage -= 1 } 
                    else{ command_log.log[entry].currentImage += 1 }
            
                    new_image = command_log.log[entry].data.images[command_log.log[entry].currentImage]
                }
            }

            //write changes to current
            const write_data = JSON.stringify(command_log)
            fs.writeFileSync(file_locations.nsfw_command_list_long, write_data, (a, b)=>{ console.log(a + b) })

            //create new embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(ctx.message.embeds[0].title)
                .setImage(new_image)
                .addFields({ name: 'request id', value: String(id), inline: true })

            //edit embed to show new data
            await msg.edit({ embeds:[embed], content: new_image})
        })

    }

}

module.exports = { rule34 }