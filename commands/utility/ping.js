const { SlashCommandBuilder } = require('discord.js');

//put inside module.exports so it can be read by other files
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!'),
  async execute(interaction){
    await interaction.reply('Pong!');
  },
};
