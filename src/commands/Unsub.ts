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
			name: 'unsub',
			aliases: [],
			description: 'Unsubscribe from notifications for a keyword',
			usage: '<prefix>unsub <keyword>',
			extraHelp: `The unsub (read: unsubscribe) command will remove a keyword from your list of keywords to receive alert notifications for.

You can get a list of your currently subscribed keywords at any time using the "<prefix>list" command.`,
			group: 'base'
		});
	}

	public action(message: Message, args: Array<string | number>, mentions: User[], original: string): any
	{
		const keyword: string = args.join(' ');
		if (!keyword) return message.channel.sendMessage(
			'You must provide a keyword to unsubscribe from notifications for.');

		const notifier: Notifier = (<WfBot> this.bot).notifier;
		const user: RegisteredUser = notifier.users.get(message.author.id);
		if (!user) return message.channel.sendMessage(
			'You are not subscribed to notifications for any keywords.');

		if (user && !user.hasKeyword(keyword))
			return message.channel.sendMessage(
				'You are not subscribed to notifications for that keyword.');

		notifier.unsubscribe(message.author, keyword);
		message.channel.sendMessage(
			`Ok, I'll no longer notify you of alert/invasion rewards containing '${keyword}'.`);
	}
}
