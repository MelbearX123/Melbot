//if a user says hello, respond with "hi"
const { Events } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		// Ignore messages from bots
		if (message.author.bot) return;

		// If a user says "hello" or "hi", respond with "Hi there!"
		if (message.content === 'hello' || message.content === 'hi') {
			message.reply('Hi there!');
		}
	},
};