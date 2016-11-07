'use strict';
import { Bot, Command } from 'yamdbf';
import { User, Message, Collection } from 'discord.js';
import { Listing, Item } from '../lib/ItemLoader';
import WfBot from '../lib/WfBot';
import * as columnify from 'columnify';

export default class Buyers extends Command
{
	public constructor(bot: Bot)
	{
		super(bot, {
			name: 'buyers',
			aliases: [],
			description: 'Get all online buyers for an item',
			usage: '<prefix>buyers [quantity] <item name>',
			extraHelp: 'You may provide an optional quanitity of listings to fetch. If quantity is omitted, it will default to 5. Otherwise it will cap at 10.',
			group: 'base'
		});
	}

	public async action(message: Message, args: Array<string | number>, mentions: User[], original: string): Promise<any>
	{
		const outMessage: Message = <Message> await message.channel.sendMessage('_Checking Warframe.market..._');
		const quantity: number = !isNaN(<number> args[0]) ? Math.min(<number> args.shift(), 10) : 5;
		const name: string = args.join(' ');
		const listings: Collection<string, Listing> = await (<WfBot> this.bot).itemLoader.getBuyers(name);

		if ((<any> listings.first()).error)
			return outMessage.edit((<any> listings.first()).error);

		const sortedListings: Listing[] = listings.array().sort((a, b) => a.price - b.price);
		sortedListings.length = quantity;

		const output: any[] = sortedListings.map((a: Listing) =>
		{
			return {
				'Ingame Name': a.user,
				'Price': `${a.price}p`,
				'Quanitity': a.count
			};
		});

		const columns: string = columnify(output,
		{
			columnSplitter: ' | ',
			maxWidth: 20
		});

		const item: Item = (<WfBot> this.bot).itemLoader.getItem(name);
		const titleString: string = `online buyers for [${name}] ${(item.type === 'Mod') ? 'rank 0' : ''}`;
		outMessage.editCode('ini',
			`${titleString}\n${'-'.repeat(Math.max(31, titleString.length))}\n${columns}`);
	}
}
