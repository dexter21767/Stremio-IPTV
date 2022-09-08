const parser = require('iptv-playlist-parser');
const axios = require('axios').default;
var cache = require('./memoryCache');

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

                    //var name = Object.keys(array[i].EXTINF)[1];
                    //var url = array[(i + 1)];
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
    var cached_value = cache.get(region);
    if (cached_value) {
        return cached_value
    } else {
        if (region == "customiptv") {
            var cat = await (m3ulist(url, region));
            if (cat.length > 1) {
                cache.set(region, cat);
            }
            return cat;
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
    console.log('region:', region, 'id:', id, 'url:', url);

    var cached_value = cache.get(region);
    if (cached_value) {
        return cached_value[id];
    } else {
        if (region == "customiptv") {
            var cat = await (m3ulist(url, region));
            if (cat.length > 1) {
                cache.set(region, cat);
            }
            return cat[id];
        } else {
            var cat = await (getm3u(region));
            if (cat.length > 1) {
                cache.set(region, cat);
            }
            return cat[id];
        }
    }
}

async function stream(id, url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];

    var cached_value = cache.get(region);
    if (cached_value) {
        var iptv = cached_value[id];
    } else {
        if (region == "customiptv") {
            var cat = await (m3ulist(url, region));
            if (cat.length > 1) {
                cache.set(region, cat);
            }
            var iptv = cat[id];
        } else {
            var cat = await (getm3u(region));
            if (cat.length > 1) {
                cache.set(region, cat);
            }
            var iptv = cat[id];
        }
    }
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
