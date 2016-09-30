require("../Globals");

/**
 * Command to display the current active alerts in Warframe.
 * Call with /alerts
 * @extends {Command}
 */
class Alerts extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Get current active Warframe alerts`;
		let usage = `${settings.prefix}alerts`;
		let help  = `The alerts command will get and return a list of the current active alerts in Warframe. Provided data includes location, mission type, time remaining, credits, and item reward.

If you would like to receive notifications for specific item rewards, take a look at the sub command with "${settings.prefix}help sub"`;

		// Activation command regex
		var command = /^alerts$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			this.bot.Say(message.author.username.cyan + " requested alerts.");

			/**
			 * Format alerts data for readability and send to channel
			 * @param {array} alerts An array of alert objects
			 * @returns {null}
			 */
			var SendAlerts = (alerts) =>
			{
				var alerts = alerts;

				// Sort alerts descending by remaing time
				alerts.sort( (a, b) =>
				{
					return Time.Difference(b.expiry, Time.now()).ms -
						Time.Difference(a.expiry, Time.now()).ms;
				});

				// Prepare the alerts for column presentation
				var formattedAlerts = new Array();
				alerts.forEach( (alert) =>
				{
					// Don't add the alert if expiry is negative
					// which indicates the alert has expired
					let expiry = Time.Difference(alert.expiry, Time.now());
					if (expiry.ms < 0) return;
					formattedAlerts.push(
					{
						mission: `${alert.node} (${alert.region})`,
						type: alert.mission + alert.desc,
						expires: expiry.toSimplifiedString(),
						credits: alert.rewards.credits,
						reward: alert.rewards.item
					});
				});

				// Format alerts data into columns
				var columns = columnify(formattedAlerts,
				{
					columnSplitter: ' | ',
					maxWidth: 30
				});

				// Send alerts to channel
				message.channel.sendCode("xl", columns);

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

			// Request alerts data and pass it to SendAlerts
			AlertGetter.GetAlerts(SendAlerts, ErrorHandler);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Alerts;
