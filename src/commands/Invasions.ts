'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message } from 'discord.js';
import { Invasion } from '../lib/EventLoader';
import WfBot from '../lib/WfBot';
import * as columnify from 'columnify';

export default class Invasions extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'invasions',
			aliases: [],
			description: 'Get current active invasions',
			usage: '<prefix>invasions',
			extraHelp: 'Invasions are refreshed every 2 minutes',
			group: 'base'
		});
	}

	public async action(message: Message, args: Array<string | number>, mentions: User[], original: string): Promise<any>
	{
		const output: string[] = (<WfBot> this.bot).eventLoader.invasions
			.map((i: Invasion) => [
				{ column1: i.invading.faction, column2: `${i.node} (${i.region})`, column3: i.defending.faction },
				{ column1: i.invading.type, column2: i.desc, column3: i.defending.type },
				{ column1: i.invading.reward, column2: i.eta, column3: i.defending.reward }
			])
			.map(a => columnify(a, {
				showHeaders: false,
				minWidth: 18,
				maxWidth: 18,
				config: { column2: { align: 'center' },	column3: { align: 'right' }	}
			}))
			.map(columns => `\`\`\`xl\n${columns}\n\`\`\``);

		let updated: string = (<WfBot> this.bot).eventLoader.invasionsFetchedAt.format('h:mm:ss a');
		let passed: string = (<WfBot> this.bot).eventLoader.invasionsFetchedAt.fromNow();
		message.channel.sendMessage(output.join(''));
		message.channel.sendMessage(`_Last updated at ${updated} (${passed})_`);
	}
}
