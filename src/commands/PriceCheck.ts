'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message, Collection } from 'discord.js';
import { Listing, Item } from '../lib/ItemLoader';
import WfBot from '../lib/WfBot';

export default class PriceCheck extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'pricecheck',
			aliases: ['pc'],
			description: 'Check the average price of an item',
			usage: '<prefix>pricecheck <item name>',
			extraHelp: '',
			group: 'base'
		});
	}

	public async action(message: Message, args: Array<string | number>, mentions: User[], original: string): Promise<any>
	{
		const outMessage: Message = <Message> await message.channel.sendMessage('_Checking Warframe.market..._');
		const name: string = args.join(' ');
		const listings: Collection<string, Listing> = await (<WfBot> this.bot).itemLoader.getSellers(name);

		if ((<any> listings.first()).error)
			return outMessage.edit((<any> listings.first()).error);

		const item: Item = (<WfBot> this.bot).itemLoader.getItem(name);
		const prices: number[] = listings.map(a => a.price);
		const average: number = prices.reduce((a, b) => a + b) / listings.size;
		const max: number = prices.reduce((a, b) => Math.max(a, b));
		const min: number = prices.reduce((a, b) => Math.min(a, b));

		const embed: any = {
			color: 8450847,
			author: {
				name: `Price check for [${item.name}]`,
				icon_url: 'http://i.imgur.com/lh5YKoc.png'
			},
			fields: [
				{
					name: 'Average price',
					value: `${average.toFixed(2)}p`,
					inline: true
				},
				{
					name: 'Lowest price',
					value: `${min}p`,
					inline: true
				},
				{
					name: 'Highest price',
					value: `${max}p`,
					inline: true
				}
			]
		};

		return outMessage.edit('', { embed: embed });
	}
}
