'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message } from 'discord.js';
import { Alert } from '../lib/EventLoader';
import WfBot from '../lib/WfBot';
import Time from '../lib/Time';
import * as columnify from 'columnify';

export default class Alerts extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'alerts',
			aliases: [],
			description: 'Get current active alerts',
			usage: '<prefix>alerts',
			extraHelp: 'Alerts are refreshed every 2 minutes',
			group: 'base'
		});
	}

	public async action(message: Message, args: Array<string | number>, mentions: User[], original: string): Promise<any>
	{
		const output: any[] = (<WfBot> this.bot).eventLoader.alerts.map((alert: Alert) =>
		{
			const expiry: string = Time.difference(alert.expiry, Time.now()).toSimplifiedString();
			return {
				mission: `${alert.node} (${alert.region})`,
					type: alert.mission + alert.desc,
					expires: expiry,
					credits: alert.rewards.credits,
					reward: alert.rewards.item
			};
		});

		const columns: string = columnify(output,
		{
			columnSplitter: ' | ',
			maxWidth: 30
		});

		let updated: string = (<WfBot> this.bot).eventLoader.alertsFetchedAt.format('h:mm:ss a');
		let passed: string = (<WfBot> this.bot).eventLoader.alertsFetchedAt.fromNow();
		message.channel.sendMessage(`\`\`\`ini\n${columns}\n\`\`\``
			+ `_Last updated at ${updated} (${passed})_`);
	}
}
