require("../Globals");

/**
 * Admin command to remotely shut down the bot and pull updates.
 * The bot will automatically restart after updating.
 * Call with /update
 * @extends {command}
 */
class Update extends Command
{
	constructor()
	{
		// Admin commands are not listed by the help command
		// and don't need helptext fields

		// Activation command regex
		var command = /^update$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			this.bot.Say(message.author.username.cyan + " requested update.");

			// Break if not admin specified in settings.json
			// or if not DM channel
			if (message.author.id != settings.admin ||
				message.channel.type != "dm") return;

			this.bot.Say("Shutting down for updates.");
			message.author.sendCode("css","Shutting down for updates.")
				.then(message =>
				{
					this.bot.db.push("/doUpdate", true);
					this.bot.db.push("/restartTime", Time.now());
					process.exit();
				});
		}

		// Pass params to parent constructor
		super(command, action);

		// Mark command as Admin only
		this.admin = true;
	}
}

module.exports = Update;
