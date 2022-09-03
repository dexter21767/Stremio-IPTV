const {
    addonBuilder
} = require("stremio-addon-sdk");

const iptv = require("./iptv");

const manifest = require("./manifest.json");

const regions = require('./regions.json');

var i = 0;
for (let region in regions) {
    manifest.catalogs[i] = {
        "type": "tv",

        "id": region,

        "name": regions[region].name
    };
    i++;
};

const builder = new addonBuilder(manifest)

    builder.defineStreamHandler((args) => {
        if ((args.type == "tv") && (args.id.match(/iptv_id:[^xyz]*/i))) {
            return Promise.resolve(iptv.stream(args.id))
            .then((streams) => ({
                    streams: streams
                }));
        } else {
            return Promise.resolve({
                streams: []
            });
        }
    });

builder.defineCatalogHandler((args) => {
    console.log(args);
    if ((args.type == "tv")) {
        return Promise.resolve(iptv.catalog(args.id))
        //.then((metas) => { console.log('metas', metas)});
        .then((metas) => ({
                metas: metas
            }));
    } else {
        return Promise.resolve({
            metas: []
        });
    }

});

builder.defineMetaHandler((args) => {
    console.log("addon.js meta:", args);
    if ((args.type == "tv") && (args.id.match(/iptv_id:[^xyz]*/i))) {
        console.log('meta iptv');
        return Promise.resolve(iptv.meta(args.id))
        //.then((metas) => { console.log('metas', metas)});
        .then((meta) => ({
                meta: meta
            }));
    } else {
        console.log('meta reject');
        return Promise.resolve({
            meta: []
        });
    }

});

module.exports = builder.getInterface()
