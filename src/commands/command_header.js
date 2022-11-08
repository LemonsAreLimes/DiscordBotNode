const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, keys } = require('../config.json');
const { guilds } = require('../guilds.json')

const { musicCommands } = require('./music')
const { rule34 } = require('./rule34')
const { e621 } = require('./e621')
const { kimcartoon } = require('./kimcartoon')
const { uberduck } = require('./uberduck')

// const { uberduck } = require('./uberduck')

//for deploy commands
class deployCommands{

    constructor(){

        this.commands = [
	
            //test command
            new SlashCommandBuilder()
                .setName('ping')
                .setDescription('Replies with pong!'),
        
            //avatar
            new SlashCommandBuilder()
                .setName('avatar')
                .setDescription('replies with a users profile picture')
                .addUserOption(option => option	
                    .setName('target')	
                    .setDescription('whos avater do u want?')),
        
            //rule34
            new SlashCommandBuilder()
                .setName('rule34')
                .setDescription('rule34 api ;) NSFW')
                .addStringOption(option => option
                    .setName('tags')
                    .setDescription('tag to search')),
        
            //e621		
            new SlashCommandBuilder()
                .setName('e621')
                .setDescription('e621 api ;) NSFW')
                .addStringOption(option => option
                    .setName('tags')
                    .setDescription('tags to search')),
        
            //KimCartoon
            new SlashCommandBuilder()
                .setName('kimcartoon')
                .setDescription('Kimcartoon api (no need to deal with ads)')
                .addStringOption(option => option
                    .setName('query')
                    .setDescription('cartoon name')),
        
            //deepdream
            new SlashCommandBuilder()
                .setName('deep_dream')
                .setDescription('deepdreams any image')
                .addAttachmentOption(option => option
                    .setName('attachment')
                    .setDescription('what should i dream up?')),
        
            //play command
            new SlashCommandBuilder()
                .setName('play')
                .setDescription("play somethin'")
                .addStringOption(option => option
                    .setName('name')
                    .setDescription('the song name to search')),
        
            //pause command
            new SlashCommandBuilder()
                .setName('pause')
                .setDescription('pause the music'),
        
            //skip command
            new SlashCommandBuilder()
                .setName('skip')
                .setDescription('turn that rank ahh shii off man'),
        
            //queue command
            new SlashCommandBuilder()
                .setName('queue')
                .setDescription('see whats up next'),
            
            //leave command
            new SlashCommandBuilder()
                .setName('leave')
                .setDescription('leaves the current voice channel'),

            //uberduck tts 
            new SlashCommandBuilder()
                .setName('uberduck')
                .setDescription('text to speech')
                .addStringOption(option => option
                    .setName('text')
                    .setDescription('what do you want the man to say?')
                    .setRequired(true))  
                .addStringOption(option => option
                    .setName('voice')
                    .setDescription('what voice do you want to use?')
                    .setAutocomplete(true))

        ].map(command => command.toJSON());

    }

    async setGuild(guildID){ 
        console.log(`adding commands to server: ${guildID}`)

        const rest = new REST({ version: '10' }).setToken(keys.token);

        //creates commands
        rest.put(Routes.applicationGuildCommands(clientId, guildID), { body: this.commands })
            .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
            .catch(console.error);
    } 

    async reloadAll(){

        const rest = new REST({ version: '10' }).setToken(keys.token);

        for (let i in guilds){
        
            console.log(`adding commands to server: ${guilds[i].id}`)
        
            //creates commands
            rest.put(Routes.applicationGuildCommands(clientId, guilds[i].id), { body: this.commands })
                .then((data) => console.log(`Successfully registered ${data.length} application commands.`))
                .catch(console.error);
        
        }
    
    }



}



module.exports = {

    deployCommands,
    musicCommands,
    rule34,
    e621,
    kimcartoon,
    uberduck, 
    
}