const { Events } = require('discord.js');
const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI(); //automatically pulls the openai api key

module.exports = {
  name: Events.MessageCreate,
  async execute(message){
    if (message.author.bot) return; //ignores messages from bots

    //moderate the messages sent using openai model
    const moderation = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: message.content,
    });

    //if the message is flagged, delete the message
    if(moderation.results[0].flagged === true){
      const logChannel = message.channel; //use same channel message was sent in
      logChannel.send('A message contained inappropriate content and was deleted!');
      message.delete();
    }

    //put the user in timeout
    const user = message.member;
    user.timeout(500, "Inappropriate Content");
  },
};
