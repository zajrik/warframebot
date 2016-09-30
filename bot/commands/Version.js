require("../Globals");

/**
 * Command to have the bot print its current version to the chat
 * Call with /version
 * @extends {command}
 */
class Version extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Print the current version of the bot`;
		let usage = `${settings.prefix}version`;
		let help  = `The version command will print the current version of the bot to the channel the command was called from.`;

		// Activation command regex
		var command = /^version$/;

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
				message.author.username.cyan + " requested version.");

			// Send version to channel
			message.channel.sendCode("css",
				`Current version is: ${pkg.version}`);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Version;
