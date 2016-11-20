'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message } from 'discord.js';
import { AllListings, Item } from '../lib/ItemLoader';
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
		const listings: AllListings = await (<WfBot> this.bot).itemLoader.getListings(name);

		if ((<any> listings.buyers.first()).error)
			return outMessage.edit((<any> listings.buyers.first()).error);

		if ((<any> listings.sellers.first()).error)
			return outMessage.edit((<any> listings.sellers.first()).error);

		const item: Item = (<WfBot> this.bot).itemLoader.getItem(name);
		const sellPrices: number[] = listings.sellers
			.map(a => a.price)
			.sort((a, b) => a - b)
			.filter((a, i, self) => self.indexOf(a) === i);
		const buyPrices: number[] = listings.buyers
			.map(a => a.price)
			.sort((a, b) => b - a)
			.filter((a, i, self) => self.indexOf(a) === i);
		const allSellPrices: number[] = listings.sellers.map(a => a.price);
		const average: number = allSellPrices.reduce((a, b) => a + b) / listings.sellers.size;

		const embed: any = {
			color: 8450847,
			author: {
				name: `Price check for [${item.name}]${item.type === 'Mod' ? ' rank 0' : ''}`,
				icon_url: 'http://i.imgur.com/lh5YKoc.png'
			},
			fields: [
				{
					name: 'Average sell price',
					value: `${average.toFixed(2)}p`,
					inline: true
				},
				{
					name: 'Lowest sell prices',
					value: sellPrices.slice(0, 3).map(a => `${a}p`).join('\n'),
					inline: true
				},
				{
					name: 'Highest buy prices',
					value: buyPrices.slice(0, 3).map(a => `${a}p`).join('\n'),
					inline: true
				}
			]
		};

		return outMessage.edit('', { embed: embed });
	}
}
