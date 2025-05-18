const { Events } = require('discord.js');
const OpenAI = require("openai");
require("dotenv").config();
const fs = require('node:fs');
const path = require('node:path');
const infractionsPath = path.join(__dirname, '..', 'infractions.json');

const openai = new OpenAI(process.env.OPENAI_API_KEY); //automatically pulls the openai api key

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

      //update the user's infraction in a JSON file
      updateInfractions(message.author.id);
      //check to see if they passed the threshold and kick them
      checkKickMember(message.member, message);
      //then check to see if they must be banned
      checkBanMember(message.member, message);
      fs.writeFileSync(infractionsPath, JSON.stringify(data, null, 2));

      //put the user in timeout after their inappropriate message
      const user = message.member;
      await user.timeout(10000, "Inappropriate Content");
      message.channel.send(`${user} has been timed out!`);
    }

  },
};

//write the functions for loading the infractions
function loadInfractions(){
  if (!fs.existsSync(infractionsPath)){ 
    fs.writeFileSync(infractionsPath, JSON.stringify({})); //create a empty json file
  }
  const data = fs.readFileSync(infractionsPath, 'utf8');
  return JSON.parse(data); //parse the data (string to js object)
}

//function for updating the infraction data
function updateInfractions(userID){
  const data = loadInfractions()

  //check if the user already has a count in the database
  if(data[userID]){
    data[userID] += 1;
  }
  else{
    data[userID] = 1;
  }

  fs.writeFileSync(infractionsPath, JSON.stringify(data, null, 2));
}

//write a function for resetting the count of infractions
function resetInfractions() {
      //rewrite file as empty object
      fs.writeFileSync(infractionsPath, JSON.stringify({}, null, 2));
      console.log("Infraction count reset!");
}

//write a function to kick a member after repeated bad behaviour
async function checkKickMember(user, message){
  const data = loadInfractions();
  const userID = user.id;

  //check if user has 5 infractions
  if (data[userID] = 5){
    //kick the user
    await user.kick('Reached 5 infractions.');
    message.channel.send(`${user.user.tag} has been kicked for repeated inappropriate behaviour.`);
    //NOTE, will not reset the infraction count. if they rejoin server and be inappropriate before count reset, BAN
  }
}

//write a function to ban member 
async function checkBanMember(user, message){
  const data = loadInfractions();
  const userID = user.id;

  //check if user has more than 6 infractions
  if (data[userID] >= 7){
    //kick the user
    await user.ban('Reached 7 infractions.');
    message.channel.send(`${user.user.tag} has been banned for repeated inappropriate behaviour.`);
  }
}

//clear the infraction count every 10 minutes
setInterval(() => {
    resetInfractions();
}, 600000); //10 minutes in milliseconds
