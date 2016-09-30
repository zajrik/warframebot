require("../Globals");

/**
 * Command for Warframe.market price lookup
 * Call with /pc mod name
 * @extends {Command}
 */
class PriceCheck extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Get average, highest, and lowest prices for an item`;
		let alias = `pc`
		let usage = `\n\t${settings.prefix}pricecheck <item name>
	${settings.prefix}pc <item name>`;
		let help  = `The price check command will get and return the average, highest, and lowest prices for an item from Warframe.market.

If you are uncertain of an items actual name, try viewing it in game or doing a wiki lookup with "${settings.prefix}wiki <item name>".

When searching for prime blueprint sets, just do the prime name + set. For example:

	${settings.prefix}pc ember prime set`;

		// Activation command regex
		var command = /^(?:pc|pricecheck) ([\w'’\(\)][\w '’\&\(\)\-]+[\w'’\(\)])$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			var result = {};
			var validResults = [];
			var average = 0;
			var itemName = message.content.match(this.command)[1];

			/**
			 * To be used as a callback for ItemGetter.GetItem()
			 * Get and print the average, lowest, and highest prices from
			 * the given data. Use name as it will be formatted when
			 * passed from ItemGetter.
			 * @param {string} data JSON string to be parsed, contains item information
			 * @param {string} type type of the item
			 * @param {name} name name of the item
			 * @returns {null}
			 */
			var GetPrices = (data, type, name) =>
			{
				// Get sellers
				try
				{
					result = JSON.parse(data)["response"]["sell"];
				}
				catch(e)
				{
					ErrorHandler("There was an error getting data from Warframe.market");
				}

				this.bot.Say(`${message.author.username.cyan} queried: ${name.yellow}`);

				// Add valid results (online ingame, rank 0 or no-rank) to array
				result.forEach( (item) =>
				{
					if (item["online_ingame"] == true
						&& (item["mod_rank"] == 0 || item["mod_rank"] === undefined))
						validResults.push(item);
				});

				// Break on no online offers
				if (validResults.length < 1)
				{
					message.channel.sendCode("css",
						`No online offers available for [${name}].\n` +
						`Consider checking Warframe.market directly.`
					);

					return;
				}

				var count = 0;
				var sum = 0;
				var lowest = 0;
				var highest = 0;

				// Get the mean, highest, and lowest prices of the valid results
				validResults.forEach( (item) =>
				{
					// Save lowest/highest prices
					if (item["price"] < lowest || lowest == 0)
						lowest = item["price"].toFixed(2);
					if (item["price"] > highest)
						highest = item["price"].toFixed(2);

					sum += item["price"];
					count++;
				});

				average = (sum / count).toFixed(2);

				this.bot.Say("Result:" + average + ", " + lowest + ", " + highest);

				// Send results to channel
				message.channel.sendCode("css",
					`Average price for [${name}] is ${average}p.\n` +
					`Lowest price is ${lowest}p.\n` +
					`Highest price is ${highest}p.`
				);

				resolve("Request completed successfully.");
			}

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

			// Request item data and execute GetPrices() when the
			// data is returned
			ItemGetter.GetItem(itemName, GetPrices, ErrorHandler);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help, alias);
	}
}

module.exports = PriceCheck;
