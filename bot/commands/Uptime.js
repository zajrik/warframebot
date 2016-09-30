require("../Globals");

/**
 * Command to see the time since the bot was launched
 * Call with /uptime
 * @extends {command}
 */
class Uptime extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Print the time since the bot was started`;
		let usage = `${settings.prefix}uptime`;
		let help  = `The uptime command will print the time since the bot was started to the channel the command was called from.`;

		// Activation command regex
		var command = /^uptime$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			this.bot.Say(message.author.username.cyan + " requested uptime.");

			// Use Time.Difference to convert uptime ms into something useable
			var uptime = Time.Difference(this.bot.uptime * 2, this.bot.uptime);

			// Send uptime to channel
			message.channel.sendCode("css", `Uptime: ${uptime.toString()}.`);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Uptime;
