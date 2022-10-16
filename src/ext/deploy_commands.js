const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const { clientId, keys , guilds} = require('../config.json');

const commands = [
	
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


].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(keys.token);

for (let i in guilds){

	console.log(`adding commands to server: ${guilds[i].id}`)

	//creates commands
	rest.put(Routes.applicationGuildCommands(clientId, guilds[i].id), { body: commands })
		.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
		.catch(console.error);

}




//detes all commands 

// // for guild-based commands
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
// .then(() => console.log('Successfully deleted all guild commands.'))
// .catch(console.error);

// // for global commands
// rest.put(Routes.applicationCommands(clientId), { body: [] })
// .then(() => console.log('Successfully deleted all application commands.'))
// .catch(console.error);
