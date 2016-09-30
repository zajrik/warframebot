require("../Globals");

/**
 * Command to unsubscribe from receiving notifivations for alert/invasion
 * reward keywords
 * @extends {command}
 */
class Unsub extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Unsubscribe from alert reward notifications for a keyword`;
		let usage = `${settings.prefix}unsub <keyword>`;
		let help  = `The unsub (read: unsubscribe) command will remove a keyword from your list of keywords to receive alert notifications for. You will receive a private message confirmation from the bot confirming your keyword removal.

If you attempt to remove a keyword you are not subscribed to you will receive a private message informing you that you were not subscribed to that keyword.

You can get a list of your currently subscribed keywords at any time using the "${settings.prefix}list" command.`;

		// Activation command regex
		var command = /^unsub(?: ([\w'’\(\)][\w '’\&\(\)\-]+[\w'’\(\)]))?$/;

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

			// Break on no keyword to unsub
			if (!match[1])
			{
				message.author.sendCode("css",
					"You must provide a keyword to unsubscribe to notifications for.");
				return;
			}

			// Find user and remove the keyword subscription from their db entry
			data.forEach( (user, index) =>
			{
				if (user[name])
				{
					// Find keyword to unsub and remove it
					var foundKeyword = false;
					for (var i = 0; i <= user[name].keywords.length; i++)
					{
						if (user[name].keywords[i] == word)
						{
							foundKeyword = true;
							this.bot.Say(`Removing keyword "${word}" for ${name}.`);
							message.author.sendCode("css",
								`You will no longer be notified of alerts and invasions with rewards ` +
								`containing the keyword "${word}".`);

							// Remove keyword from the database
							this.bot.db.delete(
								`/notifiers/alert[${index}]/${name}/keywords[${i}]`);
						}
					}
					if (!foundKeyword)
						message.author.sendCode("css",
							`You are not subscribed to keyword "${word}"`);
				}
			});
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Unsub;
