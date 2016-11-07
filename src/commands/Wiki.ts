'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message } from 'discord.js';
import * as request from 'request-promise';
import Constants from '../lib/util/Constants';

export default class Wiki extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'wiki',
			aliases: [],
			description: 'Look up a Warframe wiki article',
			usage: '<prefix>wiki <article>',
			extraHelp: '',
			group: 'base'
		});
	}

	public async action(message: Message, args: Array<string | number>, mentions: User[], original: string): Promise<any>
	{
		const name: string = args.join(' ');
		let data: any;

		try
		{
			data = await request({ uri: Constants.endpoints.wiki.search(name),
				method: 'GET', json: true, simple: false });
		}
		catch (err)
		{
			return message.channel.sendMessage('There was an error connecting to the wiki.');
		}

		if (data.exception && data.exception.code === 404)
			return message.channel.sendMessage(`Couldn't find a wiki page for '${name}'`);

		return message.channel.sendMessage(data.items[0].url);
	}
}
