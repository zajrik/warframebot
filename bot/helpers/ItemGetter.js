require("../Globals");

/**
 * Requests item data from warframe.market for a specefied item
 * and passes the received data to a provided callback method
 */
class ItemGetter
{
	constructor() {}

	/**
	 * Get the provided item data from warframe.market and
	 * pass to callback method
	 * @param {string} itemName the name of the item
	 * @param {method} callback the callback method to pass the data to
	 * @param {method} error the callback method to pass errors to
	 * @returns {null}
	 */
	static GetItem(itemName, callback, error)
	{
		// Return normalized string to allow imprecision
		// between input and data
		var Normalize = (text) =>
		{
			return text.toLowerCase()
				.replace(/[\ \&\'\(\)\’\-]/g, "");
		}

		var name = Normalize(itemName);

		// Request a list of all warframe.market items
		request("http://warframe.market/api/get_all_items_v2",
			(reqError, response, body) =>
		{
			// Break on request error
			if (reqError)
			{
				error("There was an error conencting to warframe.market");
				return;
			}

			// Search through all items, if requested item is found,
			// request buy/sell listings and send to callback method
			var success = false;
			var allItems = JSON.parse(body);
			allItems.forEach( (item) =>
			{
				if (Normalize(item["item_name"]) == name)
				{
					success = true;
					request("https://warframe.market/api/get_orders/" +
						item["item_type"] + '/' + item["item_name"],
						(reqError, response, body) =>
					{
						callback(body, item["item_type"], item["item_name"]);
					});
					return;
				}
			});

			// Send error message to error handler
			if (!success && !reqError)
				error(`"${itemName}" did not return a valid item.`);
		});
	}
}

module.exports = ItemGetter;
