require("../Globals");

/**
 * Command to display the current active invasions in Warframe.
 * Call with /invasions
 * @extends {Command}
 */
class Invasions extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = `Get current active Warframe invasions`;
		let usage = `${settings.prefix}invasions`;
		let help  = `The invasions command will get and return a list of the current active invasions in Warframe.

Invasions do not currently support item reward notifications, but support for this will be added in the near future.`;

		// Activation command regex
		let command = /^invasions$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		let action = (message, resolve, reject) =>
		{
			this.bot.Say(message.author.username.cyan + " requested invasions.");

			/**
			 * Format invasions data for readability and send to channel
			 * @param {array} invasions An array of invasion objects
			 * @returns {null}
			 */
			let SendInvasions = (data) =>
			{
				let invasions = data;
				let formattedInvasions = new Array();

				// Format each invasion
				invasions.forEach( (i) =>
				{
					let formattedInvasion =
					[
						{ column1: i.invadingFaction, column2: `${i.node} (${i.region})`, column3: i.defendingFaction},
						{ column1: i.invadingType, column2: i.desc, column3: i.defendingType},
						{ column1: i.invadingReward, column2: i.eta, column3: i.defendingReward}
					]

					let columns = columnify(formattedInvasion,
					{
						showHeaders: false,
						minWidth: 18,
						maxWidth: 18,
						config:
						{

							column2: {align: "center"},
							column3: {align: "right"}

						}
					})

					formattedInvasions.push("```xl\n" + columns + "\n```");

				});

				// Prepare formatted invasions to be sent to channel
				let invasionsToSend = ""
				formattedInvasions.forEach( (invasion) =>
				{
					invasionsToSend += invasion;
				});

				// Send invasions to channel
				// Use sendMessage rather than sendCode to maintain
				// each invasion in its own codeblock without sending
				// them to the channel in separate messages.
				message.channel.sendMessage(invasionsToSend);

				resolve("Request completed successfully.");
			}

			/**
			 * Send the error to the channel and to the reject method
			 * of the parent Promise
			 * @param {string} error error to be logged
			 * @returns {null}
			 */
			let ErrorHandler = (error) =>
			{
				message.channel.sendCode("css", error);
				reject(`Request error: ${error}`);
			}

			// Request invasions data and pass it to SendInvasions
			InvasionGetter.GetInvasions(SendInvasions, ErrorHandler);
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Invasions;
