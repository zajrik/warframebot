require("../Globals");

/**
 * Command to list available commands or print helptext
 * for the given command
 * @extends {command}
 */
class Help extends Command
{
	constructor()
	{
		// Helptext values
		let desc  = "Provides the user with a list of commands and what they do";
		let usage = `\n\t${settings.prefix}help\n\t${settings.prefix}help <command>`;
		let help  = `${settings.prefix}help will list available commands.
${settings.prefix}help <command> will print the helptext for the given command.`;

		// Activation command regex
		let command = /^help(?: (.+))?$/;

		/**
		 * Action to take when the command is received
		 * @param  {object} message message object passed by parent caller
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		let action = (message, resolve, reject) =>
		{
			let command = message.content.match(this.command)[1];

			// List all commands
			if (!command)
			{
				let helptext = "```xl\nAvailable commands:\n"

				// Find widest command name for list padding
				let maxWidth = 0;
				Object.keys(this.bot.commands.info).forEach( (key) =>
				{
					if (key.length > maxWidth) maxWidth = key.length;
				});

				// Add each command and its description to list
				Object.keys(this.bot.commands.info).forEach( (key) =>
				{
					let cmd = this.bot.commands.info[key];
					if (!cmd.admin)
						helptext += `${Pad(key.toLowerCase(), maxWidth + 1)}: ${cmd.desc}\n`;
				});
				helptext += `\nUse "${settings.prefix}help <command>" for more command information.` + "\n```"

				message.channel.sendMessage(helptext);
			}
			else
			{
				let cmd = this.bot.commands.info[command.toLowerCase()];

				// Break on invalid command name
				if (!cmd) return;

				// Send helptext to the channel
				message.channel.sendMessage(
					`\`\`\`xl\nDescription: ${cmd.desc}` +
					`${cmd.alias ? "\nAlias: " + cmd.alias : ""}\n` +
					`Usage: ${cmd.usage}\n\n${cmd.help}\n\`\`\``);
			}

			// Pad the right side of a string with spaces
			// to the desired length
			function Pad(text, length)
			{
				return text + ' '.repeat(length - text.length);
			}
		}

		// Pass params to parent constructor
		super(command, action, desc, usage, help);
	}
}

module.exports = Help;
