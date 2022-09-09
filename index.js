
const express = require('express');
const app = express();
const cors = require('cors');

const iptv = require("./iptv");

var manifest = require("./manifest.json");

const regions_ar = require('./regions.json');
const RootByte = require('./regions-RootByte.json');
const regions = { ...regions_ar, ...RootByte };
const landingTemplate = require('./landingTemplate');

app.use(cors())


app.get('/', (_, res) => {
	res.redirect('/configure')
	res.end();
});


app.get('/:configuration?/configure', (_, res) => {
	res.setHeader('content-type', 'text/html');
	res.end(landingTemplate());
});


app.get('/manifest.json', (_, res) => {
	var i = 0;
	for (let region in regions_ar) {
		manifest.catalogs[i] = {
			"type": "tv",

			"id": region,

			"name": regions_ar[region].name
		};
		i++;
	};

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/manifest.json', (req, res) => {
	console.log("dexter");
	console.log(manifest.catalogs)
	var providors = req.params.configuration.split('|')[0].split('=');

	if (providors.length > 1 && providors[1].length > 1) {
		providors = providors[1].split(',');
	} else {
		providors.length = 0;
	}
	var costumURL = atob(req.params.configuration.split('|')[1].split('=')[1]);
	console.log(costumURL);

	var c = 0;

	if (costumURL) {
		manifest.catalogs[c] = {
			"type": "tv",

			"id": "customiptv",

			"name": "Custom IPTV"
		};
		c++;
	}


	for (let i = 0; i < providors.length; i++) {

		manifest.catalogs[c] = {
			"type": "tv",

			"id": providors[i],

			"name": regions[providors[i]].name
		};
		c++;
	};


	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/:resource/:type/:id/:extra?.json', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');

	console.log(req.params);
	const { configuration, resource, type, id } = req.params;
	//const extra = req.params.extra ? qs.parse(req.url.split('/').pop().slice(0, -5)) : {}
	if (configuration !== undefined) {
		var providors = configuration.split('|')[0].split('=')
		if (providors.length > 1 && providors[1].length > 1) {
			providors = providors[1].split(',');
		} else {
			providors.length = 0;
		}
		var costumURL = atob(configuration.split('|')[1].split('=')[1]);
	}

	if (resource == "catalog") {
		if ((type == "tv")) {
			iptv.catalog(id, costumURL)
				.then((metas) => {
					res.send(JSON.stringify({ metas }));
					res.end();
				});
		}
	}
	else if (resource == "meta") {
		if ((type == "tv")) {
			console.log('costumURL', costumURL);
			iptv.meta(id, costumURL)
				.then((meta) => {
					console.log(meta)
					res.send(JSON.stringify({ meta }));
					res.end();
				});
		}
	}

	else if (resource == "stream") {
		if ((type == "tv")) {
			iptv.stream(id, costumURL)
				.then((stream) => {
					console.log(stream)
					res.send(JSON.stringify({ streams: stream }));
					res.end();
				});
		}
	} else {
		res.end();
	}

})

module.exports = app
