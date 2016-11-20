'use strict';
import * as request from 'request-promise';
import { Collection } from 'discord.js';
import Constants from './util/Constants';

/**
 * Represents an item on Warframe.market
 */
export type Item = {
	name: string;
	normalized: string;
	type: string;
	wiki?: string;
}

/**
 * Represents a buy/sell item listing on Warframe.market
 */
export type Listing = {
	count: number;
	rank?: number;
	user: string;
	price: number;
}

export type AllListings = {
	buyers: Collection<string, Listing>;
	sellers: Collection<string, Listing>;
}

export default class ItemLoader
{
	public allItems: Collection<string, Item>;

	public constructor()
	{
		this.allItems = new Collection<string, Item>();
		this._loadItems().then(() => console.log('Items loaded.')).catch(console.error);
	}

	/**
	 * Fetch all items and add them to the allItems collection
	 */
	private async _loadItems(): Promise<any>
	{
		let items: any;
		try
		{
			items = await request({ uri: Constants.endpoints.market.allItems, json: true });
		}
		catch (err)
		{
			return console.error(`There was an error loading items:\n${err}`);
		}

		let fetched: Collection<string, Item> = new Collection<string, Item>();
		for (let item of items)
		{
			let buildItem: Item = {
				name: item['item_name'],
				normalized: this._normalize(item['item_name']),
				type: item['item_type'],
				wiki: item['item_wiki']
			};
			fetched.set(buildItem.name, buildItem);
		}
		this.allItems = fetched;
	}

	/**
	 * Normalize the given text for later string comparison
	 */
	private _normalize(text: string): string
	{
		return text.toLowerCase()
			.replace(/[\ \&\'\(\)\’\-]/g, '');
	}

	/**
	 * Get all online in-game, pc-only listings for the given item and listing type
	 */
	private async _getListings(name: string, type: 'buy' | 'sell'): Promise<Collection<string, Listing>>
	{
		const listings: Collection<string, Listing> = new Collection<string, Listing>();
		const item: Item = this.getItem(name);

		if (!item)
		{
			listings.set('error', <any> { error: `Could not find item '${name}'.` });
			return listings;
		}

		let listingsData: any;
		try
		{
			listingsData = (await request(
				{ uri: Constants.endpoints.market.item(item.name, item.type), json: true }))
					.response[type];
		}
		catch (err)
		{
			listings.set('error', <any> { error: `There was an error connecting to Warframe.market.` });
			return listings;
		}

		for (let listing of listingsData)
		{
			if (!listing['online_ingame'] || /\((?:PS4|XB1)\)/.test(listing['ingame_name'])) continue;
			let buildListing: Listing = {
				user: listing['ingame_name'],
				count: listing['count'],
				rank: listing['mod_rank'] || null,
				price: listing['price']
			};
			listings.set(buildListing.user, buildListing);
		}

		if (!listings.first()) listings.set('error',
			<any> { error: 'Your search returned no online results.\nConsider checking Warframe.market directly.' });
		return listings;
	}

	/**
	 * Re-fetch all items from warframe.market
	 */
	public async reloadItems(): Promise<any>
	{
		await this._loadItems().then(() => console.log('Items successfully reloaded.')).catch(console.error);
	}

	/**
	 * Get an item by name from this.allItems
	 */
	public getItem(name: string): Item
	{
		return this.allItems.find('normalized', this._normalize(name));
	}

	/**
	 * Get all online in-game sellers for an item
	 */
	public async getSellers(name: string): Promise<Collection<string, Listing>>
	{
		return await this._getListings(name, 'sell');
	}

	/**
	 * Get all online in-game buyers for an item
	 */
	public async getBuyers(name: string): Promise<Collection<string, Listing>>
	{
		return await this._getListings(name, 'buy');
	}

	/** 
	 * Get all online in-game buyers and sellers for an item
	 */
	public async getListings(name: string): Promise<AllListings>
	{
		return {
			buyers: await this._getListings(name, 'buy'),
			sellers: await this._getListings(name, 'sell')
		};
	}
}
