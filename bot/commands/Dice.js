require("../Globals");

/**
 * A command to roll a variable sided die a variable number of times
 * @extends {Command}
 */
class Dice extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = "Roll a sided die a number of times";
		let usage = `${settings.prefix}[quantity]d<sides> [quantity]`;
		let help  = `Examples:\n\t${settings.prefix}5d20\n\t${settings.prefix}d20 5
	${settings.prefix}d10

If a quantity is not specified, a single die will be rolled. Quantity can be given before or after the "d" in the command. If for some reason you decide to provide a quantity before AND after the "d", only the quantity before will be used.

Valid die shapes are:

	d4, d6, d8, d10, d10, d12, d20, d100

The maximum number of dice that can be rolled at any one time is 100.`;

		// Activation command regex
		var command = /^(\d{1,3})?d(4|6|8|10|12|20|100)(?: (\d{1,2}))?$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var action = (message, resolve, reject) =>
		{
			var sides = message.content.match(this.command)[2];
			var dice = message.content.match(this.command)[1] ||
			 	message.content.match(this.command)[3] || 1;

			// Cap number of dice to roll at 100
			if (dice > 100) dice = 100;

			/**
			 * Roll the given number of sided dice and send the results
			 * to the channel the command was called from
			 * @param  {int} sides number of sides on the die
			 * @param  {int} dice number of dice to roll
			 * @return {null}
			 */
			var roll = (sides, dice) =>
			{
				var output = `Rolling ${dice} d${sides}:\n`;

				for (var i = 1; i <= dice; i++)
				{
					var thisRoll = Math.floor(Math.random() * sides) + 1;

					// Set spacer
					var spacer = "";
					if (sides == 100 && thisRoll < 100) spacer = " ";
					if (sides == 100 && thisRoll < 10) spacer = "  ";
					if ((sides == 20 || sides == 12 || sides == 10) &&
						thisRoll < 10) spacer = " ";

					// Add die roll to the output and right-align with spacer
					output += `[${spacer}${thisRoll}] `;

					// Add a line break every 5 die rolls
					if (i % 5 == 0) output += "\n";
				}

				message.channel.sendCode("xl", output);
			}

			roll(sides, dice);
		}
		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}
module.exports = Dice;