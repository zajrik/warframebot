'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message, Collection } from 'discord.js';
import { Listing, Item } from '../lib/ItemLoader';
import WfBot from '../lib/WfBot';

export default class Sellers extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'sellers',
			aliases: [],
			description: 'Get all online sellers for an item',
			usage: '<prefix>sellers [quantity] <item name>',
			extraHelp: 'You may provide an optional quanitity of listings to fetch. If quantity is omitted, it will default to 5. Otherwise it will cap at 10.',
			group: 'base'
		});
	}

	public async action(message: Message, args: Array<string | number>, mentions: User[], original: string): Promise<any>
	{
		const outMessage: Message = <Message> await message.channel.sendMessage('_Checking Warframe.market..._');
		const quantity: number = !isNaN(<number> args[0]) ? Math.min(<number> args.shift(), 10) : 5;
		const name: string = args.join(' ');
		const listings: Collection<string, Listing> = await (<WfBot> this.bot).itemLoader.getSellers(name);

		if ((<any> listings.first()).error)
			return outMessage.edit((<any> listings.first()).error);

		const sortedListings: Listing[] = listings.array().sort((a, b) => a.price - b.price);
		sortedListings.length = quantity;

		const item: Item = (<WfBot> this.bot).itemLoader.getItem(name);
		const embed: any = {
			color: 8450847,
			author: {
				name: `Online sellers for [${item.name}]${item.type === 'Mod' ? ' rank 0' : ''}`,
				icon_url: 'http://i.imgur.com/lh5YKoc.png'
			},
			fields: [
				{
					name: 'Ingame name',
					value: sortedListings.map(a => a.user).join('\n'),
					inline: true
				},
				{
					name: 'Price',
					value: sortedListings.map(a => `${a.price}p`).join('\n'),
					inline: true
				},
				{
					name: 'Quantity',
					value: sortedListings.map(a => a.count).join('\n'),
					inline: true
				}
			]
		};

		return outMessage.edit('', { embed: embed });
	}
}
