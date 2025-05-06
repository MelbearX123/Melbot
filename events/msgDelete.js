//if a messsage was deleted, then have melbot mention that a message was deleted
const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageDelete,
  execute(message){
    if(!message.guild) return; //return if DMs
    if(message.author.bot) return; //return if another bot sent an inappropriate message
    
    //wait to allow audit logs to update
    setTimeout(async () => {
      try {
        const fetchedLogs = await message.guild.fetchAuditLogs({
          limit: 1, //fetch the latest message
          type: AuditLogEvent.MessageDelete,
        });
        //check the first deleted message
        const deletionLog = fetchedLogs.entries.first();

        //if no log or target doesnt match,  send message
        if (!deletionLog || deletionLog.target.id !== message.author?.id) {
          return message.channel.send('A message was deleted');
        }

        const { executor, target } = deletionLog;

        //if bot deleted the message dont send message
        if (executor.bot) return;

        //user deleted it, send message
        message.channel.send('A message was deleted');
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      }
    }, 1500); //delay to allow logs to register
  },
};


