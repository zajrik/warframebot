'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message } from 'discord.js';
import { RegisteredUser } from '../lib/Notifier';
import Notifier from '../lib/Notifier';
import WfBot from '../lib/WfBot';

export default class List extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'list',
			aliases: [],
			description: 'List all subscribed keywords',
			usage: '<prefix>list',
			extraHelp: ``,
			group: 'base'
		});
	}

	public action(message: Message, args: Array<string | number>, mentions: User[], original: string): any
	{
		const notifier: Notifier = (<WfBot> this.bot).notifier;
		const keywords: string[] = notifier.getKeywords(message.author);
		if (keywords.length < 1) return message.channel.sendMessage(
			'You do not currently have any subscribed keywords.');

		const prefix: string = message.guild ? this.bot.getPrefix(message.guild) : '';
		return message.channel.sendMessage(
			`You are currently subscribed to the following keywords:\n\n\``
			+ `${keywords.join('`, `')}\`\n\n`
			+ `To unsubscribe to a keyword, use \`${prefix}unsub <keyword>\``);
	}
}
