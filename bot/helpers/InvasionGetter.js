require("../Globals");

/**
 * Requests invasion data from Deathsnacks' data dump and passes it
 * to a provided callback method after the request is complete
 */
class InvasionGetter
{
	constructor() {}

	/**
	 * Request invasion data and pass to provided callback method
	 * @param {method} callback The callback method to pass data to
	 * @param {method} error The error method to pass errors to
	 * @returns {null}
	 */
	static GetInvasions(callback, error)
	{
		// Request invasion data from Deathsnacks' data dump
		request("http://deathsnacks.com/wf/data/invasion_raw.txt",
			(reqError, response, body) =>
		{
			// Break on request error
			if (reqError)
			{
				error("There was an error conencting to invasions server.");
				return;
			}

			// Prune unwanted text, replace with shorter text if necessary
			let prune = (text) =>
			{
				return text
					.replace(/0cr/, "")
					.replace(/Blueprint/, "BP")
					.replace(/ExterminationInfest/, "")
					.replace(/Alad V /, "")
					.replace(/ Manifestation/, "")
					.replace(/Coordinate/, "Coord");
			}

			// Process each invasion and add to invasions array
			let invasions = new Array();
			body.split("\n").forEach( (invasion) =>
			{
				// break on first line and final empty invasion line
				if (!invasion.includes("|") || invasion == "") return;

				// Split invasion data string
				let data = invasion.split("|");

				// Don't show invasion if ETA is 0 or negative
				if (data[17].includes("0 hrs") || data[17].includes("-")) return;

				invasions.push(
				{
					id: data[0],
					node: data[1],
					region: data[2],
					invadingFaction: data[3],
					invadingType: prune(data[4]),
					invadingReward: prune(data[5]),
					// invadingLevel: data[6],
					// invadingAISpec: data[7],
					defendingFaction: data[8],
					defendingType: prune(data[9]),
					defendingReward: prune(data[10]),
					// defendingLevel: data[11],
					// defendingAISpec: data[12],
					// activation: data[13] * 1000,
					// // count: data[14],
					// // goal: data[15],
					percent: data[16],
					eta: data[17],
					desc: prune(data[18]) || ""
				});
			});

			callback(invasions);
		});
	}
}

module.exports = InvasionGetter;
