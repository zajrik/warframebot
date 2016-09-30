/**
 * ScheduledTask to send out notifications when keywords in a users registry
 * are found in an alert or invasion reward text
 * @extends {ScheduledTask}
 */
class RewardNotifierService extends ScheduledTask
{
	constructor(interval)
	{
		/**
		 * Task to be performed at the scheduled interval
		 * @param  {Bot} bot Discord.js Client instance
		 * @param  {method} resolve resolve method of parent Promise
		 * @param  {method} reject reject method of parent Promise
		 * @returns {null}
		 */
		var task = (bot, resolve, reject) =>
		{
			// Try and get the alert notifier data, create entry if it doesn't exist
			try
			{
				var data = bot.db.getData("/notifiers/alert");
			}
			catch (e)
			{
				bot.db.push("/notifiers/alert", [], true);
				var data = bot.db.getData("/notifiers/alert");
			}

			/**
			 * Check for alert reward keyword matches and send out notifications
			 * if matches are found using AlertNotify
			 * @param {array} alerts An array of alert objects
			 * @returns {null}
			 */
			var SendAlertNotifications = (alerts) =>
			{
				data.forEach( (user, userIndex) =>
				{
					var name = Object.keys(user)[0];
					var user = user[name];
					var userID = user.id;
					var keywords = user.keywords;
					var received = user.received;

					// Break on empty keyword array
					if (!keywords) return;

					keywords.forEach( (keyword) =>
					{
						alerts.forEach( (alert) =>
						{
							if (alert.rewards.item.toLowerCase().includes(keyword))
							{
								var duplicate = false;

								// Check for alert.id in received notifications
								if (received[alert.id])
									duplicate = true;

								// Send notification to user and add notfication id and
								// expiry to user's received notifications
								if (!duplicate)
								{
									// Make sure the alert isn't expiring
									if (Time.Difference(alert.expiry, Time.now()).ms > 1)
									{
										bot.Say(`Notifying ${name} of an alert.`);
										AlertNotify(userID, alert, keyword);
										bot.db.push(`/notifiers/alert[${userIndex}]/${name}/received/${alert.id}`,
											{expiry: alert.expiry}, true);
									}
								}
							}
						});
					});

					// Check for expired notifications for this user and remove them
					// Will remove entries for both alerts and invasions
					Object.keys(received).forEach( (key) =>
					{
						if (Time.Difference(received[key].expiry, Time.now()).ms < 1)
						{
							bot.Say(`Removing expired notification for ${name}.`);
							bot.db.delete(`/notifiers/alert[${userIndex}]/${name}/received/${key}`);
						}
					});
				});
			}

			/**
			 * Send a notification for alert reward to the user
			 * @param {int} id The id of the user to notify
			 * @param {object} alert An alert object to user for
			 *                       the notification information
			 * @param {string} key Keyword that triggered this notification
			 * @returns {null}
			 */
			var AlertNotify = (id, alert, key) =>
			{
				// Get user by ID and send message
				var user = bot.fetchUser(id);
				user.then( (user) =>
				{
					// Use sendMessage over sendCode to maintain the codeblock
					// separation between the three different parts of the
					// notification without sending separate messages
					user.sendMessage("```css\n" +
					"An alert with a reward you are tracking is available.``````xl\n" +
					`Mission: ${alert.node} (${alert.region}) | ${alert.mission}${alert.desc}\n` +
					`Rewards: ${alert.rewards.credits} - ${alert.rewards.item}\n` +
					`Expires: ${Time.Difference(alert.expiry, Time.now()).toSimplifiedString()}\n\`\`\`` +
					`\`\`\`css\nTo stop receiving notifications for this item, do /unsub ${key}\`\`\`\n\n`);
				});
			}

			/**
			 * Check for invasion reward keyword matches and send out notifications
			 * if matches are found using InvasionNotify
			 * @param {array} alerts An array of alert objects
			 * @returns {null}
			 */
			var SendInvasionNotifications = (invasions) =>
			{
				data.forEach( (user, userIndex) =>
				{
					var name = Object.keys(user)[0];
					var user = user[name];
					var userID = user.id;
					var keywords = user.keywords;
					var received = user.received;

					// Break on empty keyword array
					if (!keywords) return;

					keywords.forEach( (keyword) =>
					{
						invasions.forEach( (invasion) =>
						{
							if (invasion.invadingReward.toLowerCase().includes(keyword) ||
								invasion.defendingReward.toLowerCase().includes(keyword))
							{
								var duplicate = false;

								// Check for alert.id in received notifications
								if (received[invasion.id])
									duplicate = true;

									// Send notification to user and add notfication id and
									// expiry to user's received notifications
								if (!duplicate)
								{
									// Make sure the alert isn't expiring
									if (!invasion.eta.includes("-"))
									{
										// Set expiry to 48 hours from time of notification because
										// invasions don't provide an expiry and I don't think they
										// can even last 48 hours, so that should be playing it safe
										let expiry = Time.now() + 48 * 1000 * 60  * 60;

										bot.Say(`Notifying ${name} of an invasion.`);
										InvasionNotify(userID, invasion, keyword);
										bot.db.push(`/notifiers/alert[${userIndex}]/${name}/received/${invasion.id}`,
											{expiry: expiry}, true);
									}
								}
							}
						});
					});
				});
			}

			/**
			 * Send a notification for invasion reward to the user
			 * @param {int} id The id of the user to notify
			 * @param {object} alert An alert object to user for
			 *                       the notification information
			 * @param {string} key Keyword that triggered this notification
			 * @returns {null}
			 */
			var InvasionNotify = (id, invasion, key) =>
			{
				// Get user by ID and send message
				var user = bot.fetchUser(id);
				user.then( (user) =>
				{
					// Use sendMessage over sendCode to maintain the codeblock
					// separation between the three different parts of the
					// notification without sending separate messages
					user.sendMessage("```css\n" +
					"An invasion with a reward you are tracking is available.``````xl\n" +
					`Node: ${invasion.node} (${invasion.region})\n` +
					`Invading: ${invasion.invadingFaction} ${invasion.invadingType} | ${invasion.invadingReward}\n` +
					`Defending: ${invasion.defendingFaction} ${invasion.defendingType} | ${invasion.defendingReward}\n` +
					`${invasion.eta}\n\`\`\`` +
					`\`\`\`css\nTo stop receiving notifications for this item, do /unsub ${key}\`\`\`\n\n`);
				});
			}

			/**
			 * Send the error via reject to be logged by the
			 * parent Promise
			 * @param {string} error error to be logged
			 * @returns {null}
			 */
			var ErrorHandler = (error) =>
			{
				reject(`AlertNotifierService error: ${error.error}`);
			}

			AlertGetter.GetAlerts(SendAlertNotifications, ErrorHandler);
			InvasionGetter.GetInvasions(SendInvasionNotifications, ErrorHandler);

			resolve("AlertNotifierService ran successfully.");
		}

		// Pass params to parent constructor
		super(interval, task);
	}
}

module.exports = RewardNotifierService;
