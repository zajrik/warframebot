require("../Globals");

/**
 * Command to have the bot print its current version to the chat
 * Call with /version
 * @extends {command}
 */
class Invite extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Get an invite link to invite add this bot to a server`;
		let usage = `${settings.prefix}invite`;
		let help  = `This will require you to have "Manage Server" permissions on the server you're trying to add the bot to. Just select the server you want to add the bot to from the dropdown menu.`;

		// Activation command regex
		var command = /^invite$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			this.bot.Say(
				message.author.username.cyan + " requested an invite link.");

			// Send version to channel
			message.channel.sendMessage(`Invite me to your server with this link:\nhttps://discordapp.com/oauth2/authorize?client_id=${this.bot.user.id}&scope=bot&permissions=0`);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Invite;
