require("../Globals");

/**
 * Command to have the Bot post a link to the requested wiki article
 * Call with /wiki article name
 * @extends {Command}
 */
class Wiki extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Get a Warframe wiki article link`;
		let usage = `${settings.prefix}wiki <article name>`;
		let help  = `Examples:
	${settings.prefix}wiki blind rage
	${settings.prefix}wiki the second dream
	${settings.prefix}wiki nekros prime

The wiki command will attempt to get a Warframe wiki article matching the article name provided by the user. If the article name didn't quite match but is offered a suggestion by the Warframe wiki, the suggested link will be returned.`;

		// Activation command regex
		var command = /^wiki ([\w'’\(\)][\w '’\&\(\)\-]+[\w'’\(\)])$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			var recommendedArticleRegex = /<b>Did you mean <a href="(.+)" title/;
			var articleName = message.content.match(this.command)[1];
			var formattedArticleName = articleName
				.replace(/ /g, "_");

			this.bot.Say(message.author.username.cyan + " queried: " +
				articleName.yellow + " wiki".yellow);

			/**
			 * Send the error to the channel and to the reject method
			 * of the parent Promise
			 * @param {string} error error to be logged
			 * @returns {null}
			 */
			var ErrorHandler = (error) =>
			{
				message.channel.sendCode("css", error);
				reject(`Request error: ${error}`);
			}

			request({followAllRedirects: true, url: "http://warframe.wikia.com/wiki/" + articleName},
				(reqError, response, body) =>
			{
				// Break on request error
				if (reqError)
				{
					ErrorHandler("There was an error connecting to the Warframe wiki.");
					return;
				}

				// Return suggested url if given by the page, otherwise return the page url
				if (body.match(recommendedArticleRegex))
				{
					message.channel.sendMessage("http://warframe.wikia.com" +
						body.match(recommendedArticleRegex)[1]);
					resolve("Request completed successfully.");
				}
				else if (!body.includes("noarticletext"))
				{
					message.channel.sendMessage("http://warframe.wikia.com/wiki/" + formattedArticleName);
					resolve("Request completed successfully.");
				}
				else
					ErrorHandler(`Couldn't find a wiki page for "${articleName}".`);
			});
		}
		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}
module.exports = Wiki;
