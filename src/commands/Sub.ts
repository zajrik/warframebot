'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message } from 'discord.js';
import { RegisteredUser } from '../lib/Notifier';
import Notifier from '../lib/Notifier';
import WfBot from '../lib/WfBot';

export default class Sub extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'sub',
			aliases: [],
			description: 'Subscribe to notifications for a keyword',
			usage: '<prefix>sub <keyword>',
			extraHelp: `Examples:
	<prefix>sub catalyst
	<prefix>sub reactor
	<prefix>sub corru

The sub (read: subscribe) command will register the user to receive a notification when a Warframe alert with a reward that contains the keyword provided by the user is available. The entire word or item name is not necessary and the keyword is also not case sensitive. For example:

	<prefix>sub orok

would be perfectly valid for subscribing to alerts for both Orokin Catalyst and Orokin Reactor. However, it may be best to track catalyst and reactor separately as this will also track Orokin Cells.

If you are uncertain of the actual name of an item, try viewing it in game or doing a wiki lookup with "<prefix>wiki [item name]"`,
			group: 'base'
		});
	}

	public action(message: Message, args: Array<string | number>, mentions: User[], original: string): any
	{
		const keyword: string = args.join(' ');
		if (!keyword) return message.channel.sendMessage(
			'You must provide a keyword to subscribe to notifications for.');

		const notifier: Notifier = (<WfBot> this.bot).notifier;
		const user: RegisteredUser = notifier.users.get(message.author.id);
		if (user && user.hasKeyword(keyword))
			return message.channel.sendMessage(
				'You are already subscribed to notifications for that keyword.');

		notifier.subscribe(message.author, keyword);
		message.channel.sendMessage(
			`Ok, I'll notify you of alert/invasion rewards containing '${keyword}'.`);
	}
}
