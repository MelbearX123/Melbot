const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Correct way to load .env variables
const { CLIENT_ID, GUILD_ID, TOKEN } = process.env;
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
//grab all the command folders from command directory created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders){
  //grab all command files from commands directory created earlier
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for(const file of commandFiles){
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if('data' in command && 'execute' in command){
      commands.push(command.data.toJSON());
    } else{
      console.log(`[WARNING] The command at ${filePath} is missing a required 'data' or 'execute' property`);

    }
  }
}

//construct and prepare instance of REST module
const rest = new REST().setToken(TOKEN);

//deploy commands
(async () => {
  try{
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    //put method is used to fully refresh all commands in guild
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch(error){
    //log errors
    console.error(error);
  }
})();