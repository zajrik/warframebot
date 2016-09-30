// Pollute the global scope with modules and fields that can be
// used by whatever file loads this file. It's handy, I swear.

// Import all classes //////////////////////////////////////////////////////////

	// load settings.json, package.json
	settings = require("../settings.json");
	pkg      = require("../package.json");

	// Discord Client and bot wrapper
	Client = require("../node_modules/discord.js").Client;
	Bot    = require("./lib/Bot");

	// My lib classes
	ScheduledTask         = require("./lib/ScheduledTask");
	Scheduler             = require("./lib/Scheduler");
	Command               = require("./lib/Command");
	CommandRegistry       = require("./lib/CommandRegistry");

	// Commands
	Command_Alerts     = require("./commands/Alerts");
	Command_Invasions  = require("./commands/Invasions");
	Command_Sub        = require("./commands/Sub");
	Command_Unsub      = require("./commands/Unsub");
	Command_List       = require("./commands/List");
	Command_Wiki       = require("./commands/Wiki");
	Command_Sellers    = require("./commands/Sellers");
	Command_Buyers     = require("./commands/Buyers");
	Command_PriceCheck = require("./commands/PriceCheck");
	Command_Dice       = require("./commands/Dice");
	Command_Help       = require("./commands/Help");
	Command_Invite     = require("./commands/Invite");
	Command_Uptime     = require("./commands/Uptime");
	Command_Version    = require("./commands/Version");

	// Admin commands
	Command_Update = require("./commands/Update");

	// Tasks
	Task_RewardNotifier = require("./tasks/RewardNotifierService");

	// Static classes
	AlertGetter    = require("./helpers/AlertGetter");
	InvasionGetter = require("./helpers/InvasionGetter")
	ItemGetter     = require("./helpers/ItemGetter");
	Time           = require("./lib/Time");

	// Node Modules
	JsonDB    = require("../node_modules/node-json-db");
	colors    = require("../node_modules/colors");
	columnify = require("../node_modules/columnify");
	inspect   = require("../node_modules/util").inspect;
	request   = require("../node_modules/request");


// End class imports ///////////////////////////////////////////////////////////

// Set up color options for console text coloring
colors.setTheme(
{
	say: 'magenta',
	warn: 'yellow',
	error: 'red'
});

// Add method to capitalize every word in a string to String prototype
// Use for capitalizing item names to match warframe.market standards
String.prototype.toTitleCase = function()
{
	return this.replace(/([^\W_]+[^\s-]*) */g, (text) =>
	{
		return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
	});
}
