const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder, underscore } = require('discord.js')
const { exec } = require("child_process");
const fs = require('fs')

const { file_locations } = require('../config.json')

class kimcartoon {

    constructor(){}

    async search(ctx){

        const query = ctx.options.getString('query')

        //run the python script
        exec(`python -c "import kimcartoon; kimcartoon.get_search_results('${query}')"`, async (a, data, c) => {

            const res = JSON.parse(data)
                
            //check if there was a response
            if (res == undefined){
                ctx.editReply('something went wrong!!')
            
            } else {

                var request_id = Math.round(Math.random() * 1000000)

                //parse it and make sure its not over 25 items
                let options = []
                var larger_then_25 = false

                //read file
                const KC_log = require(file_locations.KimCartoonCmdLog)

                //append new data
                const write_data = {
                    "id":request_id,
                    "data":res
                }

                //write it to the logfile
                KC_log.push(write_data)
                fs.writeFileSync(file_locations.KimCartoonCmdLog, JSON.stringify(KC_log), (a, b)=>{ console.log(a + b) })

                for(let i in res){

                    //if larger then 25 items
                    if (i >= 25){
                        larger_then_25 = true
                        break
                    }

                    const small_name = String(res[i].title).replace('Season ','S').replace("Episode",  "E").substring(0, 99)

                    //create the entires in the selector
                    const new_option = {
                        label: small_name,
                        description: small_name,
                        value: String(i),
                    }

                    options.push(new_option)
                }

                //create the selector
                const menu = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select_season')
                            .setPlaceholder('Nothing selected')
                            .addOptions(options),
                    )

                let res_embed = []
                let components = [menu]

                if (larger_then_25 == true){

                    //create new embed
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`KimCartoon: ${query}. `)
                        .setDescription('please select a season from the dropdown menu \n\n' + 'WARING: due to discord limiting select menus to 25 items. your results may not be on the first page!')
                        .addFields({ name: 'request id', value: String(request_id), inline: true })
                        .addFields({ name: 'page', value: String(0), inline: true })
                        .addFields({ name: 'max page', value: String( Math.floor( res.length / 25 ) ), inline: true })

                    //create buttons if the response is larger then 25
                    const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('KC_prev')
                        .setLabel('prev')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                    ).addComponents(
                        new ButtonBuilder()
                        .setCustomId('KC_next')
                        .setLabel('next')
                        .setStyle(ButtonStyle.Primary)
                    )

                    res_embed.push(embed)
                    components.push(buttons)

                } else {

                    //create embed
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`KimCartoon: ${query}`)
                        .setDescription('please select a season from the dropdown menu')
                        .addFields({ name: 'request id', value: String(request_id), inline: true })

                    res_embed = [embed]
                }

                await ctx.editReply({ embeds:res_embed, components: components})

            }

        })

        

    }

    async select_season(ctx){

        const request_id = ctx.message.embeds[0].data.fields[0].value
        const value = ctx.values[0]            

        //read file
        const KC_log = require(file_locations.KimCartoonCmdLog)

        //find the request id
        let query = undefined
        for( let i in KC_log ){

            //find the value
            if( KC_log[i].id == request_id ){
                if( value != null ){ query = KC_log[i].data[value].link } 
                else { query = KC_log[i].data }   
            }
        }

        //make the request for episodes
        exec(`python -c "import kimcartoon; kimcartoon.get_episodes('${query}')"`, async (a, data, c) => {
    
            const res = JSON.parse(data)

            //check if there was a response
            if (res == undefined){
                ctx.editReply('something went wrong!!')
            
            } else {

                //create a new request id
                var new_request_id = Math.round(Math.random() * 1000000)

                //parse it and make sure its not over 25 items
                let options = []
                var larger_then_25 = false

                //read file
                const KC_log = require(file_locations.KimCartoonCmdLog)

                //append new data
                const write_data = {
                    "id":new_request_id,
                    "data":res
                }

                //write it
                KC_log.push(write_data)
                fs.writeFileSync(file_locations.KimCartoonCmdLog, JSON.stringify(KC_log), (a, b)=>{ console.log(a + b) })

                for(let i in res){

                    //if larger then 25 items
                    if (i >= 25){
                        larger_then_25 = true
                        break
                    }

                    const small_name = String(res[i].title).replace('Season ','S').replace("Episode",  "E").substring(0, 99)

                    //create the entires in the selector
                    const new_option = {
                        label: small_name,
                        description: small_name,
                        value: String(i),
                    }

                    options.push(new_option)
                }

                //create the selector
                const menu = new ActionRowBuilder()
                .addComponents(
                    new SelectMenuBuilder()
                        .setCustomId('select_episode')
                        .setPlaceholder('Nothing selected')
                        .addOptions(options),
                )

                let res_embed = []
                let components = [menu]

                if (larger_then_25 == true){

                    //create new embed
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`KimCartoon: ${query}. `)
                        .setDescription('please select an episode from the dropdown menu \n\n' + 'WARING: due to discord limiting select menus to 25 items. your results may not be on the first page!')
                        .addFields({ name: 'request id', value: String(new_request_id), inline: true })
                        .addFields({ name: 'page', value: String(0), inline: true })
                        .addFields({ name: 'max page', value: String( Math.floor( res.length / 25 ) ), inline: true })

                    //create buttons if the response is larger then 25
                    const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('KC_prev')
                        .setLabel('prev')
                        .setStyle(ButtonStyle.Primary)
                    ).addComponents(
                        new ButtonBuilder()
                        .setCustomId('KC_next')
                        .setLabel('next')
                        .setStyle(ButtonStyle.Primary)
                    )

                    res_embed.push(embed)
                    components.push(buttons)

                } else {

                    //create embed
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`KimCartoon: ${query}`)
                        .setDescription('please select an episode from the dropdown menu')
                        .addFields({ name: 'request id', value: String(new_request_id), inline: true })

                    res_embed = [embed]
                }

                await ctx.editReply({ embeds:res_embed, components: components})
            }
        })
    }

    async select_episode(ctx){

        //find the link in the db via value
        const request_id = ctx.message.embeds[0].data.fields[0].value
        const value = ctx.values[0]

        //read file
        const KC_log = require(file_locations.KimCartoonCmdLog)

        //find the request id
        let query = undefined 
        for ( let i in KC_log ){

            //find the value
            if (KC_log[i].id == request_id){
                if (value != null){ query = KC_log[i].data[value].link} 
                else { query = KC_log[i].data }   
            }
        }

        exec(`python -c "import kimcartoon; kimcartoon.get_video('${query}')"`, async (a, res, c) => {
    
            //check if there was a reply
            if (res == undefined){
                await ctx.reply('something went wrong!')
            } else {
                await ctx.editReply( {content: String(res)} )
            }

        })
    }

    async nextAndPrev(ctx){

        let request_id = ctx.message.embeds[0].data.fields[0].value

        //read file
        const KC_log = require(file_locations.KimCartoonCmdLog)

        //find the request id
        let kcData = undefined 
        for ( let i in KC_log ){

            //find the value
            if (KC_log[i].id == request_id){
                kcData = KC_log[i].data 
            }
        }

        //check if its next or prev => this will determine if a button is disabled
        let page_no = parseInt( ctx.message.embeds[0].data.fields[1].value )
        let next_page

        //determine the page next page number
        if(ctx.customId == "KC_prev" && page_no != 0){
            next_page = page_no - 1
        } else if (ctx.customId == "KC_prev" && page_no == 0){
            ctx.message.edit('you cannot do that!')
            return
        } else {
            next_page = page_no + 1
        }

        //define offset and the new data
        var offset = 25 * next_page
        let options = []

        //collect the new data
        for (let data in kcData){
            if ( data - 25 >= offset || data >= kcData.length ){
                break
            } else if (data >= offset){
                let desc = String(kcData[data].title).replace('Season ', 'S').replace('Episode ', 'E').substring(0, 99)
                
                //create the entires in the selector
                const new_option = {
                    label: desc,
                    description: desc,
                    value: String(data),
                }
                
                options.push(new_option)
            } 
        }
            
        //apply the options to the select menu
        const menu = new ActionRowBuilder()
            .addComponents(
                new SelectMenuBuilder()
                    .setCustomId('select_season')
                    .setPlaceholder('Nothing selected')
                    .addOptions(options))

        let buttons
        if (ctx.customId == "KC_prev" && page_no == 1){                                                                                         //has reached the min
            buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('KC_prev')
                .setLabel('prev')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            ).addComponents(
                new ButtonBuilder()
                .setCustomId('KC_next')
                .setLabel('next')
                .setStyle(ButtonStyle.Primary)
                
            )
        } else if (ctx.customId == "KC_next" && parseInt(ctx.message.embeds[0].data.fields[2].value) == page_no + 1){                   //has reached the max
            buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('KC_prev')
                .setLabel('prev')
                .setStyle(ButtonStyle.Primary)
            ).addComponents(
                new ButtonBuilder()
                .setCustomId('KC_next')
                .setLabel('next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
            )
        } else {                                                                                                                                        //nither
            buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('KC_prev')
                .setLabel('prev')
                .setStyle(ButtonStyle.Primary)
            ).addComponents(
                new ButtonBuilder()
                .setCustomId('KC_next')
                .setLabel('next')
                .setStyle(ButtonStyle.Primary)
            )
        }
        //define new embed
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(String( ctx.message.embeds[0].data.title ))
            .setDescription('please select a season from the dropdown menu \n\n' + 'WARING: due to discord limiting select menus to 25 items. your results may not be on the first page!')
            .addFields({ name: 'request id', value: String(request_id), inline: true })
            .addFields({ name: 'page', value: String(next_page), inline: true })
            .addFields({ name: 'max page', value: String( ctx.message.embeds[0].data.fields[2].value ) , inline: true })
        
            //edit the page number in embed
        await ctx.message.edit({ embeds:[embed], components:[menu, buttons] })
    }

}

module.exports = { kimcartoon }