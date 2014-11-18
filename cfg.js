"use strict";

let host = 'http://www.dhv.de';
let pageLimit = 50;
let hgSection = 2;

module.exports =
{
	pageLimit: pageLimit,
	host: host,
	searchUrl: host + '/db3/gebrauchtmarkt/anzeigen'
		+ '?itemsperpage=' + pageLimit
		+ '&rubrik=' + hgSection,
	rssFeed:
	{
		title: 'DHV hang-gliding offers',
		description: 'RSS-feed of hang-gliding offers from DHV.DE',
		language: 'english',
		categories: ['sport'],
		pubDate: new Date
	}
};