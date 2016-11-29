'use strict';
import { Collection } from 'discord.js';
import * as request from 'request-promise';
import * as moment from 'moment';
import { Moment } from 'moment';
import Constants from './util/Constants';
import Time from './Time';

/**
 * Represents a Warframe mission alert
 */
export type Alert = {
	id: string;
	node: string;
	region: string;
	mission: string;
	faction: string;
	begin: number;
	expiry: number;
	rewards: {
		credits: string;
		item?: string;
	}
	desc?: string;
}

/**
 * Represents a Warframe invasion mission
 */
export type Invasion = {
	id: string;
	node: string;
	region: string;
	invading: {
		faction: string;
		type: string;
		reward: string;
	}
	defending: {
		faction: string;
		type: string;
		reward: string;
	}
	percent: string;
	eta: string;
	desc?: string;
}

/**
 * Handles loading and storing Warframe alerts and invasions
 */
export default class EventLoader
{
	public alerts: Collection<string, Alert>;
	public alertsFetchedAt: Moment;
	public invasions: Collection<string, Invasion>;
	public invasionsFetchedAt: Moment;

	public constructor()
	{
		this.alerts = new Collection<string, Alert>();
		this.invasions = new Collection<string, Invasion>();
		this.loadEvents().then(() => console.log('Events loaded.')).catch(console.error);
	}

	/**
	 * Fetch all alerts and add them to the alerts collection
	 */
	private async _loadAlerts(): Promise<void>
	{
		let data: string;
		try
		{
			data = await request(Constants.endpoints.warframe.alerts);
		}
		catch (err)
		{
			return console.error('Failed to fetch alerts.');
		}

		const alerts: string[][] = data
			.split('\n')
			.filter(a => a.includes('|'))
			.map(a => a.split('|'))
			.sort((a, b) => parseInt(a[8]) - parseInt(b[8]));

		const fetchedAlerts: Collection<string, Alert> = new Collection<string, Alert>();
		for (let alert of alerts)
		{
			const begin: number = parseInt(alert[7]) * 1000;
			const expiry: number = parseInt(alert[8]) * 1000;
			if (begin > Time.now()) continue;
			if (Time.difference(expiry, Time.now()).ms < 1) continue;

			const rewards: string[] = alert[9].split(' - ');
			const buildAlert: Alert = {
				id: alert[0],
				node: alert[1],
				region: alert[2],
				mission: alert[3],
				faction: alert[4],
				begin: begin,
				expiry: expiry,
				rewards: {
					credits: rewards[0],
					item: this._prune(rewards[1] || '')
				},
				desc: this._prune(alert[10] || '')
			};
			fetchedAlerts.set(buildAlert.id, buildAlert);
		}
		this.alerts = fetchedAlerts;
		this.alertsFetchedAt = moment();
	}

	/**
	 * Fetch all invasions and add them to the invasions collection
	 */
	private async _loadInvasions(): Promise<void>
	{
		let data: string;
		try
		{
			data = await request(Constants.endpoints.warframe.invasions);
		}
		catch (err)
		{
			return console.error('Failed to fetch invasions.');
		}

		const invasions: string[][] = data
			.split('\n')
			.filter(a => a.includes('|'))
			.map(a => a.split('|'));

		const fetchedInvasions: Collection<string, Invasion> = new Collection<string, Invasion>();
		for (let invasion of invasions)
		{
			const buildInvasion: Invasion = {
				id: invasion[0],
				node: invasion[1],
				region: invasion[2],
				invading: {
					faction: invasion[3],
					type: this._prune(invasion[4]),
					reward: this._prune(invasion[5])
				},
				defending: {
					faction: invasion[8],
					type: this._prune(invasion[9]),
					reward: this._prune(invasion[10])
				},
				percent: invasion[16],
				eta: invasion[17],
				desc: this._prune(invasion[18] || '')
			};
			fetchedInvasions.set(buildInvasion.id, buildInvasion);
		}
		this.invasions = fetchedInvasions;
		this.invasionsFetchedAt = moment();
	}

	/**
	 * Prune unwanted text, replace with shorter text if necessary
	 */
	private _prune(text: string): string
	{
		return text
			.replace(/^0cr/, '')
			.replace(/Blueprint/, 'BP')
			.replace(/ExterminationInfest/, '')
			.replace(/Alad V /, '')
			.replace(/ Manifestation/, '')
			.replace(/Coordinate/, 'Coord')
			.replace(/\(Aura\)/, '')
			.replace(/VoidTearDrop/, 'Void Traces')
			.replace(/\(Archwing\)/, '(AW)')
			.replace(/Gift From The Lotus/, '(Gift)');
	}

	/**
	 * Fetch all invasions and alerts
	 */
	public async loadEvents(): Promise<void>
	{
		await Promise.all([this._loadAlerts(), this._loadInvasions()]).catch(console.error);
	}
}
