require("../Globals");

/**
 * Command to subscribe to receiving notifivations for alert/invasion
 * reward keywords
 * @extends {command}
 */
class Sub extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Subscribe to alert reward notifications for a keyword`;
		let usage = `${settings.prefix}sub <keyword>`;
		let help  = `Examples:
	${settings.prefix}sub catalyst
	${settings.prefix}sub reactor
	${settings.prefix}sub corru

The sub (read: subscribe) command will register the user to receive a notification when a Warframe alert with a reward that contains the keyword provided by the user is available. The entire word or item name is not necessary and the keyword is also not case sensitive. For example:

	${settings.prefix}sub orok

would be perfectly valid for subscribing to alerts for both Orokin Catalyst and Orokin Reactor. However, it may be best to track catalyst and reactor separately as this will also track Orokin Cells.

If you are uncertain of an items actual name, try viewing it in game or doing a wiki lookup with "${settings.prefix}wiki [item name]"

After using the command to register for an alert notification, you will receive a private message from the bot confirming your keyword registry.`;

		// Activation command regex
		var command = /^sub(?: ([\w'’\(\)][\w '’\&\(\)\-]+[\w'’\(\)]))?$/;

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

			// Break on no keyword to sub
			if (!match[1])
			{
				message.channel.sendCode("css",
					"You must provide a keyword to subscribe to notifications for.");
				return;
			}

			// Look for user, add the new keyword subscription to their keywords
			var foundUser = false;
			if (data)
			{
				data.forEach( (user, index) =>
				{
					var keywords = user[Object.keys(user)[0]].keywords;

					if (user[name])
					{
						foundUser = true;

						// Don't add a duplicate keyword
						if (keywords.includes(word))
						{
							message.author.sendCode("css",
								`You are already subscribed to the keyword "${word}".`);
							return;
						}

						// Notify the user of their subscription and add keyword
						this.bot.Say(`Registering keyword "${word}" for ${name}.`);
						message.author.sendCode("css",
							`You will now be notified of alerts and invasions with rewards ` +
							`containing the keyword "${word}".`);

						// Add the keyword to the database
						this.bot.db.push(
							`/notifiers/alert[${index}]/${name}/keywords[]`,
							word, true);
					}
				});
			}

			// Create a DB entry for the user and add their new keyword subscription
			if (!foundUser)
			{
				this.bot.Say(`Registering keyword "${word}" for ${name}.`);
				message.author.sendCode("css",
					`You will now be notified of alerts and invasions with rewards ` +
					`containing the keyword "${word}".`);

				// Add the keyword to the database
				this.bot.db.push(`/notifiers/alert[]/${name}`,
					{
						id: message.author.id,
						keywords: [word],
						received: {}
					},	true
				);
			}
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Sub;
