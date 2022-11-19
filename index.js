
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

const iptv = require("./iptv");
var manifest = require("./manifest.json");
const regions = require('./regions.json');

app.set('trust proxy', true)

app.use('/configure', express.static(path.join(__dirname, 'vue', 'dist')));
app.use('/assets', express.static(path.join(__dirname, 'vue', 'dist', 'assets')));

app.use(cors())



app.get('/', (_, res) => {
	res.redirect('/configure')
	res.end();
});


app.get('/:configuration?/configure', (_, res) => {
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('content-type', 'text/html');
	res.sendFile(path.join(__dirname, 'vue', 'dist', 'index.html'));
});


app.get('/manifest.json', (_, res) => {
	res.setHeader('Cache-Control', 'max-age=86400, public');
	res.setHeader('Content-Type', 'application/json');
	manifest.catalogs = [];
	manifest.behaviorHints.configurationRequired = true;
	res.send(manifest);
	res.end();
});


app.get('/:configuration/manifest.json', (req, res) => {
	//let manifesto = manifest;
	manifest.catalogs = [];
	configuration = atob(req.params.configuration)
	let { providors, costume, costumeLists } = iptv.ConfigCache(req.params.configuration)
	if (costume) {
		for (let i = 0; i < costume.length; i++) {
			let [id, name, url] = costume[i].split(":")
			manifest.catalogs.push({
				"type": "tv",

				"id": "stremio_iptv_id:" + id,

				"name": name,

				extra: [{ name: "search", isRequired: false }]
			});
		};
	}
	if (providors)
		for (let i = 0; i < providors.length; i++) {
			manifest.catalogs.push({
				"type": "tv",

				"id": "stremio_iptv_id:" + providors[i],

				"name": regions[providors[i]].name,

				extra: [{ name: "search", isRequired: false }]
			});
		};

	//console.log(catalog)
	//manifesto.catalogs = catalog;	
	console.log(manifest.catalogs)
	manifest.behaviorHints.configurationRequired = false;
	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');
	res.send(manifest);
	res.end();
});


app.get('/:configuration?/:resource(catalog|meta|stream)/:type/:id/:extra?.json', (req, res) => {

	res.setHeader('Cache-Control', 'max-age=86400,staleRevalidate=stale-while-revalidate, staleError=stale-if-error, public');
	res.setHeader('Content-Type', 'application/json');



	console.log(req.params);
	let { configuration, resource, type, id} = req.params;
	let extra =  Object.fromEntries(new URLSearchParams(req.params.extra));
	let { providors, costume, costumeLists } = iptv.ConfigCache(configuration)
	console.log(extra)
	console.log("costume", costume)

	let region = id.split(":")[1];
	let costumeList = costumeLists[region] ? atob(costumeLists[region].url) : '';

	if (resource == "catalog") {
		if ((type == "tv")) {
			console.log('id', id)
			console.log("catalog", region);
			if(extra && extra.search){
				console.log("search", extra.search);
				iptv.search(region, costumeList,extra.search)
				.then((metas) => {
					res.send(JSON.stringify({ metas }));
					res.end();
				}).catch(error => console.error(error));
			}else{
			iptv.catalog(region, costumeList)
				.then((metas) => {
					res.send(JSON.stringify({ metas }));
					res.end();
				}).catch(error => console.error(error));
			}
		}
	}
	else if (resource == "meta") {
		if ((type == "tv")) {
			console.log("meta", id);
			iptv.meta(id, costumeList)
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
			iptv.stream(id, costumeList)
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
