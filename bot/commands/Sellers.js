require("../Globals");

/**
 * Command to get a list of sellers from warframe.market for a given
 * item. Call with "/sellers # mod name" where # is the number of
 * listings to be retrieved. The quantity can be ommitted and
 * wil default to 5 max
 * @extends {Command}
 */
class Sellers extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Get a list of Warframe.market sellers for an item`;
		let usage = `${settings.prefix}sellers [quantity] <item name>`;
		let help  = `Examples:
	${settings.prefix}sellers transient fortitude
	${settings.prefix}sellers 10 blind rage

The sellers command will get and return a list of users on Warframe.market that are online in-game and selling the item you are looking up. The number of listings to be requested is optional. If omitted, up to 5 listings will be returned. A maximum of 10 listings can be retrieved at any time to save on message space.

If you are uncertain of an items actual name, try viewing it in game or doing a wiki lookup with "${settings.prefix}wiki <item name>".

When searching for prime blueprint sets, just do the prime name + set. For example:

	${settings.prefix}sellers ember prime set`;

		// Activation command regex
		var command = /^sellers (?:(\d{1,2}) )?([\w'’\(\)][\w '’\&\(\)\-]+[\w'’\(\)])$/;

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
			var listings = [];
			var quantity = message.content.match(this.command)[1] || 5;
			var itemName = message.content.match(this.command)[2];

			/**
			 * To be used as a callback for ItemGetter.GetItem()
			 * Get a list of item listings and parse online sellers
			 * from the data
			 * @param {string} data JSON string to be parsed, contains item information
			 * @param {string} type type of the item
			 * @param {name} name name of the item
			 * @returns {null}
			 */
			var GetListings = (data, type, name) =>
			{
				result = JSON.parse(data)["response"]["sell"];

				this.bot.Say(`${message.author.username.cyan} queried: ` +
					`${name} sellers`.yellow);

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
						`No online offers available for [${name}] sellers.\n` +
						`Consider checking Warframe.market directly.`
					);

					return;
				}

				// Enforce quanitity restrictions
				if (quantity > 10) quantity = 10;
				if (quantity > validResults.length)
					quantity = validResults.length;

				// Sort valid results by price
				validResults.sort( (a, b) =>
				{
					return a["price"] - b["price"];
				});

				// Remove unnecessary data from results and add the user
				// specified number of results to the listings, capped at 10
				// or defaulted to 5
				for (var i = 0; i < quantity; i++)
				{
					delete validResults[i]["online_ingame"];
					delete validResults[i]["online_status"];
					delete validResults[i]["mod_rank"];
					listings.push(
					{
						"Ingame Name": validResults[i]["ingame_name"],
						"Price": validResults[i]["price"] + "p",
						"Quanitity": validResults[i]["count"]
					});
				}

				// Format listing data into columns
				var columns = columnify(listings,
				{
					columnSplitter: ' | ',
					maxWidth: 20
				});

				// Send listings to channel
				message.channel.sendCode("xl",
					`online sellers for [${name}] ` +
						`${(type == "Mod") ? "rank 0" : ""}\n` +
					"------------------------------------------------\n" +
					columns
				);
				this.bot.Say("Result:\n" + columns);

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
			ItemGetter.GetItem(itemName, GetListings, ErrorHandler);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Sellers;
