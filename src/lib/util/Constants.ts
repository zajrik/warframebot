'use strict';

type Endpoints = {
	market: {
		allItems: string;
		item: (name: string, type: string) => string;
	},
	warframe: {
		alerts: string,
		invasions: string
	},
	wiki: {
		search: (query: string) => string;
	}
}

type BotConstants = {
	MARKET_API: string;
	DEATHSNACKS_API: string;
	WF_WIKI_API: string;
	endpoints?: Endpoints;
}

const Constants: BotConstants = <any> {}; // tslint:disable-line
Constants.MARKET_API = 'http://warframe.market/api';
Constants.DEATHSNACKS_API = 'http://deathsnacks.com/wf/data';
Constants.WF_WIKI_API = 'http://warframe.wikia.com/api/v1';
Constants.endpoints = {
	market: {
		allItems: `${Constants.MARKET_API}/get_all_items_v2`,
		item: (name: string , type: string) => `${Constants.MARKET_API}/get_orders/${type}/${name}`
	},
	warframe: {
		alerts: `${Constants.DEATHSNACKS_API}/alerts_raw.txt`,
		invasions: `${Constants.DEATHSNACKS_API}/invasion_raw.txt`
	},
	wiki: {
		search: (query: string) => `${Constants.WF_WIKI_API}/Search/List?query=${query}&limit=1`
	}
};
export default Constants;
