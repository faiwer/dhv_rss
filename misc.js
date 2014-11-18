"use strict";

let request = require('request');
let $ = require('whacko');
let th = require('thunkify');
let _ = require('lodash');
let cfg = require('./cfg.js');

let loadPage = function(url, callback)
{
	log.info('load url: %s', url);
	request(url, function(err, response, html)
	{
		if(err)
			return callback(err);

		try
		{
			let $wh = $.load(html);
			if(!$wh('#gm_content').length)
				log.warn('can\'t find #gm_content');
			callback(null, $wh)
		}
		catch(e)
		{
			callback(e);
		}
	});
};

let winston = require('winston');
global.log = new winston.Logger;
var logIntances =
	[
		{ kind: 'Console', cfg: { name: 'con', colorize: true, prettyPrint: true, } },
		{ kind: 'File', cfg: { name: 'err', filename: 'logs/error.log', level: 'error', maxsize: 1024 * 1024 * 20 }, },
		{ kind: 'File', cfg: { name: 'access', filename: 'logs/access.log', levels: 'info,warn', maxsize: 1024 * 1024 * 20 }, },
	];
_.each(logIntances, function(li)
	{
		let kind = winston.transports[li.kind];
		log.add(kind, li.cfg);
	});

let makeRss = function(offers)
{
	let RSS = new require('rss');
	let rss = new RSS(_.extend(cfg.rssFeed));

	_.each(offers, function(item)
	{
		rss.item(
			{
				title: item.title,
				description: item.html,
				url: item.link,
				guid: item.id,
				date: item.date
			});
	});

	return rss;
}

module.exports =
{
	loadPage: th(loadPage),
	makeRss: makeRss
};