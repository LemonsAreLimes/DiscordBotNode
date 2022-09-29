// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuBuilder  } = require('discord.js');
const fs = require('fs')

const { token, joiner_channel, nsfw_command_list_long, nsfw_command_list, banned_roles, KimCartoon_log_long, KimCartoon_log } = require('./config.json');
const { apis } = require('./api/nsfw_api');
const { KimCartoonApi } = require('./api/cartoon_api')

//set the rich presense
const set_activity = require('./ext/set_activity'); set_activity

//music command stuff
// const { joinVoiceChannel } = require('@discordjs/voice');

// Create a new client instance
const client = new Client({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
    });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Rokos Baskilisk is back online!');
});

//user join event
client.on('guildMemberAdd', async member => {

    //send welcome message in welcome channel
    client.channels.cache.get(joiner_channel).send(
        `welcome ${member.user.username}#${member.user.discriminator} to the server~
        check out #roles to be verified among outher things`
    )
    
});


//command and button events
client.on('interactionCreate', async interaction => {
    
	const { commandName } = interaction;


    //chat and slash commands
    if (interaction.isChatInputCommand()){

        if (commandName === 'ping') {               //online test command           
            await interaction.reply('Pong!');
    
        } else if (commandName === 'server') {      //no use                        
            await interaction.reply('Server info.');

    
        } else if (commandName === 'avatar'){       //avatar <- does not yet work   
    
            const user = interaction.options.getUser('target');
            console.log(user)
    
            interaction.reply(user.avatar)
    
        } else if (commandName === 'rule34'){       //rule34                        
    
            //get the inputs
            const private_search = interaction.options.getBoolean('private')
            const tags = interaction.options.getString('tags')
    
            //get the image via inputs
            const controller = new apis
            controller.rule34(tags)
    
            await sleep(1500)
            const data = controller.return_data
    
            //save all image links to command log
            const command_log = require(nsfw_command_list)
            let id = Math.round(Math.random() * 1000000)
            let time = new Date()
    
            const new_command_data = {
                "id":id,
                "data":{
                    "commandCreation":time,
                    "currentImage":1,
                    "tags":tags,
                    "private":private_search,
                    "images":data
                }
            }
    
            //add to file
            command_log.log.push(new_command_data)
            const write_data = JSON.stringify(command_log)
    
            fs.writeFileSync(nsfw_command_list_long, write_data, (a, b)=>{
                console.log(a + b)
            })
    
            //create embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Rule34 ;)')
                .setImage(data[0])
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
            await interaction.reply({ embeds:[embed], components: [buttons]})
        } else if (commandName === 'e621'){         //e621                          
            //get the inputs
            const private_search = interaction.options.getBoolean('private')
            const tags = interaction.options.getString('tags')

            //get the image via inputs
            const controller = new apis
            controller.e621(tags.replace(/ /g, '+'))

            await sleep(1500)
            const data = controller.return_data

            //save all image links to command log
            const command_log = require(nsfw_command_list)
            let id = Math.round(Math.random() * 1000000)
            let time = new Date()

            const new_command_data = {
                "id":id,
                "data":{
                    "commandCreation":time,
                    "currentImage":1,
                    "tags":tags,
                    "private":private_search,
                    "images":data
                }
            }

            //add to file
            command_log.log.push(new_command_data)
            const write_data = JSON.stringify(command_log)

            fs.writeFileSync(nsfw_command_list_long, write_data, (a, b)=>{
                console.log(a + b)
            })

            //create embed
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Rule34 ;)')
                .setImage(data[0])
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
            await interaction.reply({ embeds:[embed], components: [buttons]})

        } else if (commandName === 'deep_dream'){   //deepdream                     

            //get the attachment url
            let image_url = interaction.options.getAttachment('attachment').url
            
            //send it to the deepdream api
            let image = await controller.deepDream(image_url)

            //send the response (image url)
            await interaction.reply(String(image))
        } else if (commandName === 'roles'){        //roles                         

            let asked_role = interaction.options.getRole('role')


            //check if the user is allowed the role
            var is_banned_role = false
            for (role in banned_roles){
                if (banned_roles[role] == asked_role.id){is_banned_role = true}
            }

            
            if (is_banned_role == false){
                interaction.member.roles.add(asked_role)                
                interaction.reply(`${interaction.member.displayName} got role: ${asked_role.name}`)
            } else {
                interaction.reply('you do not have permissions to do that')
            }



        } else if (commandName === 'music'){        //for future development

            const connection = getVoiceConnection(myVoiceChannel.guild.id);
            console.log(connection)

            //search for the audio
            //if audio works
                //join the vc 
                //download the audio
                //play it

            //else
                //display fail msg


        } else if (commandName === 'kimcartoon'){   //kimcartoon api (gets video link)

            await interaction.deferReply()
            const query = interaction.options.getString('query')
            
            //get api to search for results
            const KCapi = new KimCartoonApi()
            KCapi.get_search_results(query)

            await sleep(5000)
            const res = KCapi.return_data

            //check if there was a response
            if (res == undefined){
                interaction.editReply('something went wrong!!')
            
            } else {

                var request_id = Math.round(Math.random() * 1000000)

                //parse it and make sure its not over 25 items
                let options = []
                var larger_then_25 = false

                //read file
                const KC_log = require(KimCartoon_log)

                //append new data
                const write_data = {
                    "id":request_id,
                    "data":res
                }

                //write it
                KC_log.push(write_data)
                fs.writeFileSync(KimCartoon_log_long, JSON.stringify(KC_log), (a, b)=>{ console.log(a + b) })


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
                        .setDescription('please select a season from the dropdown menu')
                        .addFields({ name: 'request id', value: String(request_id), inline: true })

                    res_embed = [embed]
                }

                await interaction.editReply({ embeds:res_embed, components: components})

            }
        }

    }

    //menu events               (ALL OF THIS NEEDS TO BE REWORKED)
    if( interaction.isSelectMenu() ){

        if (interaction.customId === 'select_season'){          //gets the episode from main select menu
            
            await interaction.deferReply()

            //find the link in the db via value
            const request_id = interaction.message.embeds[0].data.fields[0].value
            const value = interaction.values[0]
            let query = ''

            //read file
            const KC_log = require(KimCartoon_log)

            //find the request id
            for ( let i in KC_log ){

                //find the value
                if (KC_log[i].id == request_id){
                    query = KC_log[i].data[value].link
                }
            }

            const KCapi = new KimCartoonApi()
            KCapi.get_episodes(query)

            await sleep(5000)
            const res = KCapi.return_data

            //check if there was a response
            if (res == undefined){
                interaction.editReply('something went wrong!!')
            
            } else {

                var new_request_id = Math.round(Math.random() * 1000000)

                //parse it and make sure its not over 25 items
                let options = []
                var larger_then_25 = false

                //read file
                const KC_log = require(KimCartoon_log)

                //append new data
                const write_data = {
                    "id":new_request_id,
                    "data":res
                }

                //write it
                KC_log.push(write_data)
                fs.writeFileSync(KimCartoon_log_long, JSON.stringify(KC_log), (a, b)=>{ console.log(a + b) })

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

                await interaction.editReply({ embeds:res_embed, components: components})

            }

        } else if (interaction.customId === 'select_episode') { //gets the video link from season select menu

            await interaction.deferReply()

            //find the link in the db via value
            const request_id = interaction.message.embeds[0].data.fields[0].value
            const value = interaction.values[0]
            let query = ''

            //read file
            const KC_log = require(KimCartoon_log)

            //find the request id
            for ( let i in KC_log ){

                //find the value
                if (KC_log[i].id == request_id){
                    query = KC_log[i].data[value].link
                }
            }
        
            const KCapi = new KimCartoonApi()
            KCapi.video_link(query)

            await sleep(4000)
            const res = KCapi.return_data

            await interaction.editReply( {content: String(res)} )

        }

        
    }

    //button events
    if (interaction.isButton()){

        if (interaction.customId == "prev" || interaction.customId == "next"){              //prev / next buttons

            await interaction.deferUpdate()

            //get message and channel id
            let msg_id = interaction.message.id
            let channel_id = interaction.channelId

            //edit the message that called the button
            client.channels.cache.get(channel_id).messages.fetch(msg_id).then( async (msg) => {

                //get id of embed
                let id = interaction.message.embeds[0].data.fields[0].value

                //query the command history file for next / prev image
                const command_log = require(nsfw_command_list)
                let new_image = ''

                for (entry in command_log.log){
                    if (command_log.log[entry].id == id){
                        if (interaction.customId == "prev"){ command_log.log[entry].data.currentImage -= 1 } 
                        else { command_log.log[entry].data.currentImage += 1 }
                
                        new_image = command_log.log[entry].data.images[command_log.log[entry].data.currentImage]
                    }
                }

                //write changes to current
                const write_data = JSON.stringify(command_log)
                fs.writeFileSync(nsfw_command_list_long, write_data, (a, b)=>{ console.log(a + b) })

                //create new embed
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rule34 ;)')
                    .setImage(new_image)
                    .addFields({ name: 'request id', value: String(id), inline: true })

                //edit embed to show new data
                await msg.edit({ embeds:[embed], content: new_image})
            })

        
        } else if (interaction.customId == "KC_prev" || interaction.customId == "KC_next"){

            await interaction.deferUpdate()

            //get the request id
            let id = interaction.message.embeds[0].data.fields[0].value
            let page_no = parseInt( interaction.message.embeds[0].data.fields[1].value )

            //check if its next or prev
            if(interaction.customId == "KC_prev" && page_no != 0){
                next_page = page_no - 1
            } else if (interaction.customId == "KC_prev" && page_no == 0){
                interaction.message.edit('you cannot do that!')
                return
            } else {
                next_page = page_no + 1
            }

            //search for it in the kimcartoon log
            const KC_log = require(KimCartoon_log)

            //find the correct reques
            for (let i in KC_log){

                //get the data from it
                if (KC_log[i].id == id){

                    //define offset and the new data
                    var offset = 25 * next_page
                    let options = []

                    for (let data in KC_log[i].data){

                        if ( data - 25 >= offset || data >= KC_log[i].data.length ){

                            //when done getting the data
                            break
                            
                        } else if (data >= offset){
                            let desc = String(KC_log[i].data[data].title).replace('Season ', 'S').replace('Episode ', 'E').substring(0, 99)

                            //create the entires in the selector
                            const new_option = {
                                label: desc,
                                description: desc,
                                value: String(data),
                            }

                            options.push(new_option)
                        } 
                    }
                        
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

                    //change the options in select menu
                    const menu = new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select_season')
                            .setPlaceholder('Nothing selected')
                            .addOptions(options),
                    )

                    //get the title of embed
                    const title = String(interaction.message.embeds[0].data.title)

                    //define new embed
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(title)
                        .setDescription('please select a season from the dropdown menu \n\n' + 'WARING: due to discord limiting select menus to 25 items. your results may not be on the first page!')
                        .addFields({ name: 'request id', value: id, inline: true })
                        .addFields({ name: 'page', value: String(next_page), inline: true })

                    //edit the page number in embed
                    await interaction.message.edit({ embeds:[embed], components:[menu, buttons] })
                }

            }


        }


    }


});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Login to Discord with your client's token
client.login(token);
