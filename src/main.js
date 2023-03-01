const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const { musicCommands, rule34, e621, deployCommands, uberduck } = require('./commands/command_header');
const { keys, reloadCommandsOnReady } = require('./config.json');
const { guilds } = require('./guilds.json');


// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction
    ],
});

// When the client is ready, run this code (only once)
client.once('ready', async () => {
    if( reloadCommandsOnReady == true ){
        console.log('reloading commands...')
        await new deployCommands().reloadAll()
    }

    console.log('██████╗  ██████╗ ██╗  ██╗ ██████╗ ┌┐ ┌─┐┌─┐┬┬  ┬┌─┐┬┌─')
    console.log('██╔══██╗██╔═══██╗██║ ██╔╝██╔═══██╗├┴┐├─┤└─┐││  │└─┐├┴┐')
    console.log('██████╔╝██║   ██║█████╔╝ ██║   ██║└─┘│ ┴└─┘┴┴─┘┴└─┘┴ │')
    console.log('██╔══██╗██║   ██║██╔═██╗ ██║   ██║   │~is now online!│')
    console.log('██║  ██║╚██████╔╝██║  ██╗╚██████╔╝   ┴───────────────┴')
    console.log('╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ written by lemonsarelimes')

});

//user join event
client.on('guildMemberAdd', async member => {

    //get the current guild
    const guild_id = member.guild.id

    //find the guilds joiner channel in config 
    for (let i in guilds){

        if (guilds[i].id == guild_id && guilds[i].joiner_channel != ""){
            
            //create the embed
            const embed = new EmbedBuilder()
                .setColor(0x2FFF00)
                .setTitle(`${member.user.username}#${member.user.discriminator} has joined the server~`)

            //send it
            client.channels.cache.get(guilds[i].joiner_channel).send({ embeds:[embed] })
            break
        }
    }
});


//user leave event
client.on('guildMemberRemove', async member => {

    //get the current guild
    const guild_id = member.guild.id

    //find the guilds joiner channel in config 
    for (let i in guilds){

        if (guilds[i].id == guild_id && guilds[i].joiner_channel != ""){
            
            //create the embed
            const embed = new EmbedBuilder()
                .setColor(0xFF001A)
                .setTitle(`${member.user.username}#${member.user.discriminator} has left the server :/`)

            //send it
            client.channels.cache.get(guilds[i].joiner_channel).send({ embeds:[embed] })
            break
        }
    }
});

//when the bot joins a guild this will be worked on next update
client.on('guildCreate', async guild => {

    //add the slash commands to this guild
    await new deployCommands().setGuild(guild.id)

    //add the guild to the guilds list
    //send a message to the user that sent the message => edits config

});

//reacton roles (add)
client.on('messageReactionAdd', async (message, user) => {

    //check the guilds in the config
    for( let i in guilds ){

        //if the messasge id is correct
        if( guilds[i].role_add_message == message.message.id){
        
            const emoji = message.emoji.name

            //look for the emoji in the role table
            for( let x in guilds[i].roles.role_table ){

                //when found
                if( guilds[i].roles.role_table[x].emoji == emoji ){

                    //get all the varibles n stuff ykyk
                    const guild = await client.guilds.fetch(message.message.guildId)
                    const role = await guild.roles.fetch(guilds[i].roles.role_table[x].id)
                    const target = await guild.members.fetch(user.id)
                
                    //apply the role to the user
                    await target.roles.add(role)

                }

            }

        } 
    }
});

//reaction roles (remove)
client.on('messageReactionRemove', async (message, user) => {
    //get the role id in the guild config
    for( let i in guilds ){

        //if the message id is correct
        if( guilds[i].role_add_message == message.message.id ){

            const emoji = message.emoji.name 
            for( let x in guilds[i].roles.role_table ){

                //when found
                if( guilds[i].roles.role_table[x].emoji == emoji ){

                    //get all the vars
                    const guild = await client.guilds.fetch(message.message.guildId)
                    const role = await guild.roles.fetch(guilds[i].roles.role_table[x].id)
                    const target = await guild.members.fetch(user.id)
                
                    //remove the role from the user
                    await target.roles.remove(role)
                    

                }

            }

        }

    }


});

//create the active players list (only used for music commands)
let active_players = []

//commands, select menus, buttons and autocomplete interactions
client.on('interactionCreate', async interaction => {
	const { commandName } = interaction;

    if (interaction.isChatInputCommand()){                   //slash commands   

        if (commandName === 'ping') {               //online test command           
            await interaction.reply('Pong!');
    
        } else if (commandName === 'avatar'){       //avatar                        
    
            //get the user data
            const user = interaction.options.getUser('target');

            //create the embed
            const embed = new EmbedBuilder()
                .setTitle(`${user.username}'s avatar`)
                .setImage(String(user.avatarURL()))

            //send it off
            interaction.reply({ embeds:[embed] })
    
        } else if (commandName === 'rule34'){       //rule34                        
            await new rule34().search(interaction)

        } else if (commandName === 'e621'){         //e621                          
            await new e621().search(interaction)



        } else if (commandName === 'play'){         //music commands                

            await interaction.deferReply()
            
            //check if the user is in a voice channel
            if( !interaction.member.voice.channel ){
                console.log('user is in a voice channel')
                await interaction.editReply('you need to be in a voice channel') 
                return
            } 

            //search for the audio
            const command_handler = new musicCommands(client)
            const search_result = await command_handler.search(interaction)

            //check if there already is a connection to the guild
            if( active_players != [] ){
                for( let i in active_players ){

                    //remove any players that are disabled
                    if( active_players[i].id == null ){
                        delete active_players[i]
                    
                    } else if( active_players[i].id == interaction.guildId){

                        //if its playing add to queue
                        if( active_players[i].playing ){
                            active_players[i].queue.push(search_result)

                            //create the embed 
                            const embed = new EmbedBuilder()
                                .setColor(0x00FF66)
                                .setTitle(`adding: ${search_result.title} to the queue`)

                            await interaction.editReply({ embeds: [embed] })
                        } else {
                            active_players[i].play(search_result)
                        }
                        return
                    }
                }
            }

            //initalize the music command hanler and connect to the voice channel
            command_handler.init(interaction)
            await command_handler.connect(interaction)
            
            //download and play the file
            await command_handler.play(search_result)
            
            //create embed
            const embed = new EmbedBuilder()
                .setColor(0x00E5FF)
                .setTitle(`now playing: ${search_result.title}`)

            //respond to the interaction
            await interaction.editReply({embeds: [embed]})
            active_players.push(command_handler)

        } else if (commandName === 'pause'){                                        

            //find the player
            if( active_players != [] ){
                for( let i in active_players ){
                    if( active_players[i].id == interaction.guild.id ){

                        let embed
                        if( active_players[i].paused ){ embed = new EmbedBuilder().setColor(0x00E5FF).setTitle("unpaused") } 
                        else { embed = new EmbedBuilder().setColor(0x00E5FF).setTitle("pasued")  }
                        active_players[i].pause()

                        await interaction.reply({ embeds:[embed] })
                        return
                    }
                }
            } else {
                await interaction.reply('bro theres nothing playing whatchu expect to happen')
            }

        } else if (commandName === 'skip'){                                         
            //find the player
            if( active_players != [] ){
                for( let i in active_players ){
                    if( active_players[i].id == interaction.guild.id ){

                        //check if its playing something
                        if( active_players[i].playing ){
                            const q = active_players[i].queue
                            active_players[i].play(q[0])

                            //create embed
                            const embed = new EmbedBuilder()
                                .setColor(0x00FFBF)
                                .setTitle(`now playing: ${q[0].title}`)

                            await interaction.reply({embeds: [embed]})
                            q.pop(0)
                            
                        } else {
                            //create embed 
                            const embed = new EmbedBuilder()
                                .setColor(0xFF002F)
                                .setTitle('there is nothing playing...')

                            await interaction.reply({embeds: [embed]})
                        }

                    }
                }
            } else {
                await interaction.reply('bro theres nothing playing whatchu expect to happen')
            }

        } else if (commandName === 'queue'){                                        
            await interaction.deferReply()
            
            //find the player
            if( active_players != [] ){
                for( let i in active_players ){
                    if( active_players[i].id == interaction.guild.id ){

                        let response = ''
                        for( let x in active_players[i].queue ){
                            response += active_players[i].queue[x].title + '\n' 
                        }

                        console.log(response)
                        console.log(response.length)

                        if( response == '' ){ 
                            console.log('empty res')
                            const embed = new EmbedBuilder().setColor(0xFF003C).setTitle('there is nothing in the queue') 
                            await interaction.editReply({ embeds: [embed] })
                            break
                        }
                        else { 
                            console.log('non emmpty resposne')
                            const embed = new EmbedBuilder().setColor(0x00FF66).setTitle("Queue").setDescription(response)
                            await interaction.editReply({ embeds: [embed] })
                            break
                        }
                    }
                }
            } else {
                await interaction.reply('bro theres nothing playing whatchu expect to happen')
            }
        } else if (commandName === 'clear'){                                        

            
            //find the player
            if( active_players != [] ){
                for( let i in active_players ){
                    if( active_players[i].id == interaction.guild.id ){
                        if( active_players[i].queue = []){ await interaction.reply('there is nothing in the queue') } 
                        else{ active_players[i].queue = []; await interaction.reply('clearing the queue') }
                        return
                    }
                }
            } else {
                await interaction.reply('guild id not found in active players')
            }

 
 
        } else if (commandName === 'leave'){                                        

            //find the player
            if( active_players != [] ){
                for( let i in active_players ){
                    if( active_players[i].id == interaction.guild.id ){
                        active_players[i].disconnect()

                        const embed = new EmbedBuilder()
                            .setColor(0x00FF66) 
                            .setTitle('leaving')

                        await interaction.reply({ embeds:[embed] })
                        active_players.pop(i)
                        return
                    }
                }
            } else {
                await interaction.reply('guild id not found in active players')
            }

        } else if (commandName === 'uberduck'){     //uberduck tts                  
            await interaction.deferReply()
            let voice = interaction.options.getString('voice')
            let text = interaction.options.getString('text')

            let x = new uberduck();
            let link = await x.gen_speech(text, voice, interaction)
            x.send_response(text, voice, link, interaction )
    
        }

    }else if( interaction.isButton() ){                      //button events    

        if (interaction.customId == "prev" || interaction.customId == "next"){                  //prev / next buttons for nsfw commands

            await interaction.deferUpdate()
            await new rule34().getRequest(client, interaction)  //will work for both rule34 and e621
        } 
    
    }else if( interaction.isAutocomplete() ){                //autocomplete     
        
        if( commandName == 'uberduck' ){
            let q = interaction.options.getString('voice')
            let x = await new uberduck().search_voices(q)
            interaction.respond(x)
        }
        
    }else {
        console.log('command not recognized!')
    } 

});

//login to discord
client.login(keys.token);
