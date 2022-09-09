const parser = require('iptv-playlist-parser');
const axios = require('axios').default;
//var cache = require('./memoryCache');
const NodeCache = require( "node-cache" );
const cache = new NodeCache( { stdTTL: 43200, checkperiod: 3600 } );


const regions_ar = require('./regions.json');
const RootByte = require('./regions-RootByte.json');
const regions = { ...regions_ar, ...RootByte };

async function getm3u(region) {
    console.log(region);
    url = regions[region].url;
    return await m3ulist(url, region)
}
function m3ulist(url, region) {
    if (url) {
        console.log(url)
        return axios.get(url, { timeout: 10000 }).then(data => {
            var array = (parser.parse(data.data)).items;
            var arr = [];
            for (i = 0; i < array.length; i++) {
                if (array[i].http.referrer == "" && array[i].http['user-agent'] == "") {
                    arr.push({
                        id: "iptv_id:" + region + ":" + i,
                        name: array[i].name,
                        type: "tv",
                        poster: array[i].tvg.logo,
                        posterShape: 'landscape',
                        url: array[i].url
                    });
                }
            }
            return arr
        }).catch(error => { console.error(error) })
    } else {
        return;
    }
}

async function catalog(region, url) {
    if (region == "customiptv") {
        var cached_value = cache.get(url);
        if (cached_value) {
            return cached_value;
        } else {
            var cat = await (m3ulist(url, region));
            if (cat.length > 1) {
                cache.set(url, cat);
            }
            return cat;
        }
    } else {
        var cached_value = cache.get(region);
        if (cached_value) {
            return cached_value;
        } else {
            var cat = await (getm3u(region));
            if (cat.length > 1) {
                cache.set(region, cat);
            }
            return cat;
        }
    }
}

async function meta(id, url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    return (await catalog(region, url))[id];
}

async function stream(id, url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    var iptv = (await catalog(region, url))[id];
    
    stream = [{
        name: iptv.name,
        description: iptv.name,
        url: iptv.url,
        behaviorHints: {
            notWebReady: true,
        }
    }
    ];
    return stream;
}

module.exports = {
    catalog,
    meta,
    stream
};
