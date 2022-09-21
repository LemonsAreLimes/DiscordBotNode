const { SlashCommandBuilder, Routes, SelectMenuOptionBuilder, CommandInteractionOptionResolver } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('../croonfig.json');

const commands = [
	
	//test command
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),

	//avatar
	new SlashCommandBuilder().setName('avatar').setDescription('replies with a users profile picture').addUserOption(option => option	.setName('target')	.setDescription('whos avater do u want?')),

	//rule34
	new SlashCommandBuilder().setName('rule34').setDescription('rule34 api ;) NSFW').addBooleanOption(option => option.setName('private').setDescription('only you can view the response (false by default)')).addStringOption(option => option.setName('tags').setDescription('tag sto search')),

	//e621		
	new SlashCommandBuilder().setName('e621').setDescription('e621 api ;) NSFW').addBooleanOption(option => option.setName('private').setDescription('only you can view the response (false by default')).addStringOption(option => option.setName('tags').setDescription('tags to search')),

	//deepdream
	new SlashCommandBuilder().setName('deep_dream').setDescription('deepdreams any image').addAttachmentOption(option => option.setName('attachment').setDescription('what should i dream up?')),

	//roles
	new SlashCommandBuilder().setName('roles').setDescription('gives you a role').addRoleOption(option => option.setName('role').setDescription('what role do you want?'))

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

//creates commands
rest.put(Routes.applicationGuildCommands("994133223674228736", guildId), { body: commands })
	.then((data) => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);


//detes all commands 

// // for guild-based commands
// rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
// .then(() => console.log('Successfully deleted all guild commands.'))
// .catch(console.error);

// // for global commands
// rest.put(Routes.applicationCommands(clientId), { body: [] })
// .then(() => console.log('Successfully deleted all application commands.'))
// .catch(console.error);