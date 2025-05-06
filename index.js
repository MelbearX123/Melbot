const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, IntentsBitField } = require('discord.js');
require('dotenv').config();

//the client is the bot, so initialize new client object
const client = new Client({
  intents:[
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages,
  ],
});

client.commands = new Collection(); //make new commands collection

//deal with the command handling
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders){
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles){
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    //set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command){
      client.commands.set(command.data.name, command);
    }
    else{
      console.log(`[WARNING] the command at ${filePath} is missing a required 'data' or 'execute' property.`);
    }
  }
}

//handle the events so the index.js file can interact with the files in events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

//get the bot online
client.login(process.env.TOKEN);

//notes for myself
//async - means that while this part of the code is running, do the rest asynchronously 
//await - will pause the code until the async part finishes