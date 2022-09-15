const parser = require('iptv-playlist-parser');
const axios = require('axios').default;
//var cache = require('./memoryCache');
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });


const regions_ar = require('./regions.json');
const RootByte = require('./regions-RootByte.json');
const regions = { ...regions_ar, ...RootByte };

async function getm3u(region) {
    console.log("region",region);
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

                let tv = {
                    id: "iptv_id:" + region + ":" + i,
                    name: array[i].name,
                    type: "tv",
                    poster: array[i].tvg.logo,
                    posterShape: 'landscape',
                    url: array[i].url
                }
                if (array[i].http['user-agent'] || array[i].http['http-referrer']) {
                    tv.behaviorHints = {};
                    tv.behaviorHints.notWebReady = true;
                    tv.behaviorHints.proxyHeaders = {};
                    tv.behaviorHints.proxyHeaders.request = {};
                    if (array[i].http['http-referrer']) {
                        tv.behaviorHints.proxyHeaders.request['referrer'] = array[i].http['http-referrer'];
                    }
                    if (array[i].http['user-agent']) {
                        tv.behaviorHints.proxyHeaders.request['User-Agent'] = array[i].http['user-agent'];
                    }
                    console.log(tv);
                }

                arr.push(tv);
            }
            return arr
        }).catch(error => { console.error(error) })
    } else {
        return;
    }
}

async function catalog(region, url) {
    console.log(region)
    if (region == "customiptv") {
        if (cache.get(url)) {
            return cache.get(url);
        } else {
            var cat = await (m3ulist(url, region));
            if (cat.length > 1) {
                cache.set(url, cat);
            }
            return cat;
        }
    } else {
        if ( cache.get(region)) {
            return  cache.get(region);
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
    console.log(region,id)
    return (await catalog(region, url).catch(error=>console.error(error)))[id];
}

async function stream(id, url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    var iptv = (await catalog(region, url).catch(error=>console.error(error)))[id];

    let stream = {
        name: iptv.name,
        description: iptv.name,
        url: iptv.url
    };
    if(iptv["behaviorHints"]){
        stream["behaviorHints"]=iptv["behaviorHints"];
    }
    return [stream];
}

module.exports = {
    catalog,
    meta,
    stream
};
