'use strict';
import { Bot, BotOptions } from 'yamdbf';
import TimerCollection from './timer/TimerCollection';
import Timer from './timer/Timer';
import ItemLoader from './ItemLoader';
import EventLoader from './EventLoader';
import Notifier from './Notifier';

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

		this.timers.add(new Timer(this, 'events', 2 * 60, async () => this.eventLoader.loadEvents()));
		this.timers.add(new Timer(this, 'items', 5 * 60 * 60, async () => this.itemLoader.reloadItems()));
		this.timers.add(new Timer(this, 'notify', 60, async () => this.notifier.checkEvents()));
		this.timers.add(new Timer(this, 'pruneNotifications', 5 * 60, async () => this.notifier.checkExpired()));
	}
}
