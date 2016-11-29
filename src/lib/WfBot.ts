'use strict';
import { Bot, BotOptions } from 'yamdbf';
import TimerCollection from './timer/TimerCollection';
import Timer from './timer/Timer';
import ItemLoader from './ItemLoader';
import EventLoader from './EventLoader';
import Notifier from './Notifier';

/**
 * Extend Bot class to allow for extra properties and
 * necessary method extensions 
 */
export default class WfBot extends Bot
{
	public timers: TimerCollection<string, Timer>;
	public itemLoader: ItemLoader;
	public eventLoader: EventLoader;
	public notifier: Notifier;

	public constructor(botOptions: BotOptions)
	{
		super(botOptions);
		this.timers = new TimerCollection<string, Timer>();
		this.itemLoader = new ItemLoader();
		this.eventLoader = new EventLoader();
		this.notifier = new Notifier(this);

		this.timers
			.add(new Timer(this, 'events', 2 * 60, async () => this.eventLoader.loadEvents()))
			.add(new Timer(this, 'items', 5 * 60 * 60, async () => this.itemLoader.reloadItems()))
			.add(new Timer(this, 'notify', 60, async () => this.notifier.checkEvents()))
			.add(new Timer(this, 'prune', 5 * 60, async () => this.notifier.checkExpired()));
	}

	/**
	 * Destroy all timers before calling super destroy()
	 */
	public destroy(): Promise<void>
	{
		this.timers.destroyAll();
		return super.destroy();
	}
}
