'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message } from 'discord.js';

export default class Invite extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'invite',
			aliases: [],
			description: 'Get an invite url for this bot',
			usage: '<prefix>invite',
			extraHelp: '',
			group: 'base'
		});
	}

	public action(message: Message, args: Array<string | number>, mentions: User[], original: string): any
	{
		message.channel.sendMessage(`You can invite me to your server with this link:\nhttps://discordapp.com/oauth2/authorize?client_id=${this.bot.user.id}&scope=bot\n\nThanks for choosing me for your Warframe information needs! 👏`);
	}
}
