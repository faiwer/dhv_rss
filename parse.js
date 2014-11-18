"use strict";

let misc = require('./misc.js');
let host = require('./cfg.js').host;

let _ = require('lodash');
let $ = require('whacko');
let moment = require('moment');
moment.locale('ru');

let parseDate = function(date)
{
	let d = date.trim().split(/\.|\//);
	return moment([d[2], d[1] - 1, d[0]]).toDate();
};

let parsePrivate = function($el)
{
	let info = {};

	$el.find('.private li').each(function(idx, li)
	{
		let txt = $(li).text();
		let m;

		m = txt.match(/Land:\s+(.*)$/);
		if(m)
			return info.location = m[1].trim();

		m = txt.match(/Online\s+seit:\s+(.*)$/)
		if(m)
		{
			info.date = parseDate(m[1]);
			info.dateStr = moment(info.date).format('L');
			return;
		}

		m = txt.match(/Ort:\s+(.*)$/)
		if(m)
			return info.place = m[1].trim();
	});

	return info;
};

let prepareHTML = function(data)
{
	let html = '';

	if(data.details)
		html += '<p>Details: ' + (data.details || '').trim() + '</p>';

	html += '<p>Information:</p><ul>';

	if(data.info)
	{
		let info = data.info;
		if(info.location)
			html += '<li>Location: ' + info.location + (info.place ? ', ' + info.place : '') + '</li>';
		if(info.date)
			html += '<li>Date: ' + info.dateStr + '</li>';
	}

	if(data.price)
		html += '<li>Price: ' + data.price + '</li>';

	html += '</ul>';

	if(data.image)
		html += '<p>Image:<br/><img src="' + host + data.image + '"/></p>';

	return html;
}

let parseOffer = function(el)
{
	let $el = $(el);
	let data = {id: $el.attr('id')};

	let $link = $el.find('h2 a');
	data.title = $link.text();
	data.link = host + $link.attr('href');

	let $content = $el.find('.bodytext');
	if($content && $content.length)
		data.details = $content.text();

	data.info = parsePrivate($el);
	data.date = data.info.date;

	data.price = $el.find('.gm_price').eq(0).text() + ' ' +
		$el.find('.gm_price_type').eq(0).text();

	let $img = $el.find('img');
	if($img && $img.length)
	{
		let imgSrc = $img.attr('src');
		if(imgSrc && !/dummy\.png$/.test(imgSrc))
			data.image = $img.attr('src');
	}

	data.html = prepareHTML(data);
	return data;
}

let getList = function($wh)
{
	let $content = $wh('#gm_content').eq(0);
	return $content.find('.gm_offer');
};

let getPageCount = function($wh, pageLimit)
{
	let $last = $wh('.page_last').eq(0);
	if(!$last.length)
		return 1;

	let classes = $last.attr('class').split(/\s+/);

	let num;
	_.any(classes, function(c)
		{
			let m = c.match(/item_(\d+)/, c);
			if(m)
			{
				num = m[1];
				return true;
			}
		});
	if(!num)
	{
		log.warn('can\'t find last page');
		return 1;
	}

	let count = Number(pageLimit) + Number(num);
	return Math.ceil(count / pageLimit);
}

let whackoToArray = function($list)
{
	return _.map(_.range(0, $list.length), function(idx){ return $list.eq(idx); });
}

module.exports =
{
	getPageCount: getPageCount,
	getList: getList,
	whackoToArray: whackoToArray,
	parseOffer: parseOffer,
	sortByDate: function(a, b){ return +a.date > +b.date ? +1 : -1;	}
}