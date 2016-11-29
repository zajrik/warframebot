'use strict';
import { Collection, User, Message } from 'discord.js';
import { LocalStorage } from 'yamdbf';
import { Alert, Invasion } from './EventLoader';
import WfBot from './WfBot';
import Time from './Time';

/**
 * Represents a user's subscription to the notifier
 * service. Contains the user's subscribed keywords
 * and the notifications the user has received that
 * have yet to expire
 */
export class RegisteredUser
{
	public id: string;
	public keywords: string[];
	public received: { [id: string]: number };

	public constructor(user: User | string, keywords?: string[], received?: { [id: string]: number })
	{
		this.id = (<User> user).id || <string> user;
		this.keywords = keywords || [];
		this.received = received || {};
	}

	/**
	 * Check if the user already has a keyword
	 */
	public hasKeyword(keyword: string): boolean
	{
		return this.keywords.includes(keyword);
	}

	/**
	 * Return this user's data in a format able to be saved
	 * to persistent storage
	 */
	public toSavable(): SavableUser
	{
		return { id: this.id, keywords: this.keywords, received: this.received };
	}
}

/**
 * Represents a user's subscription to the notifier
 * service as an object that can be saved to persistent
 * storage
 */
export type SavableUser = {
	id: string,
	keywords: string[];
	received: { [id: string]: number };
}

/**
 * Handles the storage and notification of users
 * subsribed to Warframe alert/invasion reward notifications
 */
export default class Notifier
{
	private _bot: WfBot;
	private _storage: LocalStorage;
	public users: Collection<string, RegisteredUser>;

	public constructor(bot: WfBot)
	{
		this._bot = bot;
		this._storage = new LocalStorage('storage/notifier');
		this._loadUsers();
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
	 * Fetch subscribed users from notifier storage
	 */
	private _fetchUsers(): Collection<string, RegisteredUser>
	{
		const fetchedUsers: Collection<string, RegisteredUser> = new Collection<string, RegisteredUser>();
		const users: { [id: string]: SavableUser } = this._storage.getItem('users') || {};
		for (let id of Object.keys(users))
		{
			const user: SavableUser = users[id];
			const registeredUser: RegisteredUser = new RegisteredUser(user.id, user.keywords, user.received);
			fetchedUsers.set(user.id, registeredUser);
		}
		return fetchedUsers;
	}

	/**
	 * Fetch users and save into collection cache
	 */
	private _loadUsers(): void
	{
		this.users = this._fetchUsers();
	}

	/**
	 * Save the user collection cache to persistent storage
	 */
	private _saveUsers(): void
	{
		let toSave: { [id: string]: SavableUser } = {};
		this.users.forEach(a => toSave[a.id] = a.toSavable());
		this._storage.setItem('users', toSave);
	}

	/**
	 * Notify a user of an alert with a reward including
	 * a subscribed keyword
	 */
	private async _alertNotify(user: RegisteredUser, alert: Alert): Promise<Message>
	{
		const fetchedUser: User = await this._bot.fetchUser(user.id);
		user.received[alert.id] = alert.expiry;
		this.users.set(user.id, user);
		this._saveUsers();
		const output: string = `\`\`\`css\n`
			+ `An alert with a reward you are tracking is available.\n\`\`\`\`\`\`xl\n`
			+ `Mission: ${alert.node} (${alert.region}) | ${alert.mission}${alert.desc}\n`
			+ `Rewards: ${alert.rewards.credits} - ${alert.rewards.item}\n`
			+ `Expires: ${Time.difference(alert.expiry, Time.now()).toSimplifiedString()}\n\`\`\``;
		return <Message> await fetchedUser.sendMessage(output);
	}

	/**
	 * Notify a user of an invasion with a reward including
	 * a subscribed keyword
	 */
	private async _invasionNotify(user: RegisteredUser, invasion: Invasion): Promise<Message>
	{
		const fetchedUser: User = await this._bot.fetchUser(user.id);
		user.received[invasion.id] = Date.now() + (7 * 24) * 1000 * 60 * 60;
		this.users.set(user.id, user);
		this._saveUsers();
		const output: string = `\`\`\`css\nAn invasion with a reward you are tracking is available.\`\`\`\`\`\`xl\n`
			+ `Node: ${invasion.node} (${invasion.region})\n`
			+ `Invading: ${invasion.invading.faction} ${invasion.invading.type} | ${invasion.invading.reward}\n`
			+ `Defending: ${invasion.defending.faction} ${invasion.defending.type} | ${invasion.defending.reward}\n`
			+ `${invasion.eta}\n\`\`\``;
		return <Message> await fetchedUser.sendMessage(output);
	}

	/**
	 * Iterate users, filter events based on reward keyword
	 * matches and whether or not the user has been notified
	 * of that event already, and notify the user of any
	 * resulting applicable events.
	 */
	public async checkEvents(): Promise<void>
	{
		for (let user of this.users.array())
		{
			const alertMatches: Collection<string, Alert> = this._bot.eventLoader.alerts
				.filter((a: Alert) => user.keywords
					.filter(b => this._normalize(a.rewards.item)
						.includes(this._normalize(b)) && !user.received[a.id]).length > 0);
			for (let alert of alertMatches.array()) await this._alertNotify(user, alert);

			const invasionMatches: Collection<string, Invasion> = this._bot.eventLoader.invasions
				.filter((a: Invasion) => user.keywords
					.filter(b => (this._normalize(a.invading.reward).includes(this._normalize(b))
						|| this._normalize(a.defending.reward).includes(this._normalize(b)))
						&& !user.received[a.id]).length > 0);
			for (let invasion of invasionMatches.array()) await this._invasionNotify(user, invasion);
		}
	}

	/**
	 * Check the received notification expiry times for all
	 * users and remove expired notifications
	 */
	public async checkExpired(): Promise<void>
	{
		for (let user of this.users.values())
		{
			const fetchedUser: RegisteredUser = user;
			for (let id in user.received)
			{
				if (Time.difference(user.received[id], Time.now()).ms < 1)
					delete fetchedUser.received[id];
			}
			this.users.set(user.id, fetchedUser);
		}
		this._saveUsers();
	}

	/**
	 * Add a keyword to a user's keywords. Be sure to check if
	 * the keyword already exists before subscribing so that
	 * an error message can be sent to the calling channel
	 */
	public subscribe(user: User, keyword: string): void
	{
		let fetchedUser: RegisteredUser = this.users.get(user.id);
		if (!fetchedUser) fetchedUser = new RegisteredUser(user.id, [keyword]);
		else fetchedUser.keywords.push(keyword);
		this.users.set(user.id, fetchedUser);
		this._saveUsers();
	}

	/**
	 * Remove a keyword from a users' subscribed keywords, removing
	 * the user from the collection cache if there are none remaining.
	 * Be sure to check if the keyword exists before unsubscribing
	 * so that an error message can be sent to the calling channel
	 */
	public unsubscribe(user: User, keyword: string): void
	{
		let fetchedUser: RegisteredUser = this.users.get(user.id);
		if (!fetchedUser) return;
		fetchedUser.keywords.splice(fetchedUser.keywords.indexOf(keyword), 1);
		if (fetchedUser.keywords.length === 0) this.users.delete(fetchedUser.id);
		else this.users.set(fetchedUser.id, fetchedUser);
		this._saveUsers();
	}

	/**
	 * Return an array of a users' subscribed keywords
	 */
	public getKeywords(user: User): string[]
	{
		return this.users.has(user.id) ? this.users.get(user.id).keywords : [];
	}
}
