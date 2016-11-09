'use strict';
import * as path from 'path';
import WfBot from './lib/WfBot';
const config: any = require('./config.json');

const bot: WfBot = new WfBot({
	name: 'WarframeBot',
	token: config.token,
	config: config,
	version: '2.0.0',
	statusText: 'Try @mention help',
	commandsDir: path.join(__dirname, 'commands'),
	disableBase: [
		'disablegroup',
		'enablegroup',
		'listgroups',
		'version',
		'reload'
	]
})
.removeDefaultSetting('disabledGroups')
.setDefaultSetting('prefix', '/')
.start();

bot.on('ready', () => console.log('\u0007'));
