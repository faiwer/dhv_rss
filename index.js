"use strict";

let co = require('co');

let parse = require('./parse.js');
let misc = require('./misc.js');
let cfg = require('./cfg.js');
let _ = require('lodash');

co(function *()
{
	try
	{
		let $wh = yield misc.loadPage(cfg.searchUrl);
		let pageCount = parse.getPageCount($wh, cfg.pageLimit);
		log.info('pages found %s', pageCount);

		let html = [$wh];
		for(let i = 1; i < pageCount; ++ i)
		{
			let url = cfg.searchUrl + '&start=' + (i * cfg.pageLimit);
			html.push(yield misc.loadPage(url));
		}

		let offers = _(html)
			.map(parse.getList)
			.map(parse.whackoToArray)
			.flatten()
			.map(parse.parseOffer)
			.uniq('id')
			.sort(parse.sortByDate)
			.value();
		log.info('found offers: %d', offers.length);

		if(offers.length)
		{
			let rss = misc.makeRss(offers);
			var xml = rss.xml('\t');
			console.log(xml);
		}
		else log.error('empty result');
	}
	catch(e)
	{
		log.error(e);
		console.log(e.stack);
	}
});

// RSS
// gitHub