require("../Globals");

/**
 * Command to list current alert/invasion reward
 * notification subscription keywords
 * @extends {command}
 */
class List extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `See your list of currently subscribed keywords`;
		let usage = `${settings.prefix}list`;
		let help  = `The list command will provide the user with a private message containing a list of all their currently subscribed reward notification keywords.

The user will also be given a reminder of how to use the ${settings.prefix}unsub command to remove a keyword from their list.`;

		// Activation command regex
		var command = /^list(?: (.+))?$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			var match = message.content.match(this.command);

			// Try and get the notifier registry data, create entry if it doesn't exist
			try
			{
				var data = this.bot.db.getData("/notifiers/alert");
			}
			catch (e)
			{
				bot.db.push("/notifiers/alert", [], true);
				var data = this.bot.db.getData("/notifiers/alert");
			}

			var name = message.author.username + "#" + message.author.discriminator;
			var word = match[1] ? match[1].toLowerCase() : undefined;

			// Break on extra arguments
			if (match[1])
			{
				message.author.sendCode("css",
					`Usage: ${settings.prefix}list\n\nList command does not take any additional arguments.`);
				return;
			}

			let keywordList = "";
			data.forEach( (user) =>
			{
				if (user[name])
				{
					for (let i = 0; i < user[name].keywords.length; i++)
					{
						keywordList += user[name].keywords[i] + "\n";
					}
				}
			});

			// Send list of subscribed keywords to the user
			message.author.sendCode("css",
				`Your subscribed keywords:\n${keywordList}\n` +
				`To unsubscribe from a keyword use "${settings.prefix}unsub <keyword>"`);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = List;
