// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs')

const { token, joiner_channel, nsfw_command_list_long, nsfw_command_list, banned_roles } = require('./config.json');
const { apis } = require('./api/api');

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

//msg event
client.on('messageCreate', async res => {

    if (res.content == 'heroku'){
        res.channel.send('fuck heroku')
    }

})


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



        } else if (commandName === 'music'){

            const connection = getVoiceConnection(myVoiceChannel.guild.id);
            console.log(connection)

            //search for the audio
            //if audio works
                //join the vc 
                //download the audio
                //play it

            //else
                //display fail msg


        } else if (commandName === 'watch'){

            //search for the show on kimcartoon.li
            //join the vc
            //play the clip somehow


        }


        //join                                   
        //play                                  ytlink to play -> prev, skip, pause/play, stop buttons 

        //vote                                  yes / no buttons 
        
        //help
        //reddit <- simmilar to r34 and e621    next, prev buttons
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
                fs.writeFileSync(nsfw_command_list_long, write_data, (a, b)=>{
                    console.log(a + b)
                })

                //create new embed
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Rule34 ;)')
                    .setImage(new_image)
                    .addFields({ name: 'request id', value: String(id), inline: true })

                //edit embed to show new data
                await msg.edit({ embeds:[embed], content: new_image})
            })

        
        }


    }


});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Login to Discord with your client's token
client.login(token);
