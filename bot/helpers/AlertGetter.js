require("../Globals");

/**
 * Requests alerts data from Deathsnacks' data dump and passes it
 * to a provided callback method after the request is complete
 */
class AlertGetter
{
	constructor() {}

	/**
	 * Request alert data and pass to provided callback method
	 * @param {method} callback The callback method to pass data to
	 * @param {method} error The error method to pass errors to
	 * @returns {null}
	 */
	static GetAlerts(callback, error)
	{
		// Request alert data from Deathsnacks' data dump
		request("http://deathsnacks.com/wf/data/alerts_raw.txt",
			(reqError, response, body) =>
		{
			// Break on request error
			if (reqError)
			{
				error("There was an error conencting to alerts server.");
				return;
			}

			// Process each alert and add to alerts array
			var alerts = new Array();
			body.split("\n").forEach( (alert) =>
			{
				// break on final empty alert line
				if (alert == "") return;

				// Split alert data string
				var data = alert.split("|");

				// Don't add alert if it hasn't begun yet
				if (data[7] * 1000 > Time.now()) return;

				// Split rewards into credits and item
				var rewards = data[9].split(" - ");

				// Replace some reward item words with shorthand or otherwise
				if (rewards[1]) rewards[1] = rewards[1]
					.replace(/Blueprint/g, "BP")
					.replace(/\(Aura\)/, "")
					.replace(/VoidTearDrop/, "Void Traces");

				// Get extra alert description info and replace anything
				// necessary with shorthand or otherwise to save space
				var desc = data[10];
				if (desc) desc = desc
					.replace(/\(Archwing\)/, "(AW)")
					.replace(/Gift From The Lotus/, "(Gift)");

				alerts.push(
				{
					id: data[0],
					node: data[1],
					region: data[2],
					mission: data[3],
					faction: data[4],
					levelMin: data[5],
					levelMax: data[6],
					// Convert begin and expiry from secs to ms
					begin: data[7] * 1000,
					expiry: data[8] * 1000,
					rewards: {
						credits: rewards[0],
						item: rewards[1] || ""
					},
					desc: desc || ""
				});
			});

			callback(alerts);
		});
	}
}

module.exports = AlertGetter;
