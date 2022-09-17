
const express = require('express');
const app = express();
const cors = require('cors');

const iptv = require("./iptv");

var manifest = require("./manifest.json");

const regions = require('./regions.json');

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
	for (let region in regions) {
		manifest.catalogs[i] = {
			"type": "tv",

			"id": "stremio_iptv_id:" + region,

			"name": regions[region].name
		};
		i++;
	};

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/manifest.json', (req, res) => {
	const catalog = [];
	var providors = req.params.configuration.split('|')[0].split('=');

	if (providors.length > 1 && providors[1].length > 1) {
		providors = providors[1].split(',');
	} else {
		providors.length = 0;
	}
	var costumURL = atob(req.params.configuration.split('|')[1].split('=')[1]);


	if (costumURL) {
		catalog.push({
			"type": "tv",

			"id": "stremio_iptv_id:customiptv",

			"name": "Custom IPTV"
		});
	}

	for (let i = 0; i < providors.length; i++) {
		catalog.push({
			"type": "tv",

			"id": "stremio_iptv_id:" + providors[i],

			"name": regions[providors[i]].name
		});
	};

	manifest.catalogs = catalog;
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/:resource/:type/:id.json', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');

	console.log(req.params);
	let { configuration, resource, type, id } = req.params;

	if (configuration !== undefined) {
		var providors = configuration.split('|')[0].split('=')
		if (providors.length > 1 && providors[1].length > 1) {
			providors = providors[1].split(',');
		} else {
			providors.length = 0;
		}
		if (configuration.split('|')[1].split('=').length > 1) {
			var costumURL = atob(configuration.split('|')[1].split('=')[1]);
		}
	}

	if (resource == "catalog") {
		if ((type == "tv")) {
			region = id.split(":")[1];
			console.log('id', id)
			console.log("catalog", region);
			iptv.catalog(region, costumURL)
				.then((metas) => {
					res.send(JSON.stringify({ metas }));
					res.end();
				}).catch(error => console.error(error));
		}
	}
	else if (resource == "meta") {
		if ((type == "tv")) {
			console.log("meta", id);
			console.log('costumURL', costumURL);
			iptv.meta(id, costumURL)
				.then((meta) => {
					console.log(meta)
					res.send(JSON.stringify({ meta }));
					res.end();
				}).catch(error => console.error(error));
		}
	}

	else if (resource == "stream") {
		if ((type == "tv")) {
			console.log("stream", id);
			iptv.stream(id, costumURL)
				.then((stream) => {
					console.log(stream)
					res.send(JSON.stringify({ streams: stream }));
					res.end();
				}).catch(error => console.error(error));
		}
	} else {
		res.end();
	}

})

module.exports = app
