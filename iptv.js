const parser = require('iptv-playlist-parser');
const axios = require('axios').default;
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });


const regions = require('./regions.json');

async function getm3u(region) {
    console.log("region", region);
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
                    url: array[i].url,
                    background: array[i].tvg.logo
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
                    //console.log(tv);
                }

                arr.push(tv);
            }
            return arr
        }).catch(error => { console.error(error) })
    } else {
        return;
    }
}
async function get_iptv(region, url) {
    if (region == "customiptv") {
        if (cache.get(url) !== undefined) {
            var iptv = cache.get(url);
        } else {
            var iptv = await (m3ulist(url, region));
            if (iptv.length > 1) {
                cache.set(url, iptv);
            }
        }
    } else {
        if (cache.get(region) !== undefined) {
            var iptv = cache.get(region);
        } else {
            var iptv = await (getm3u(region));
            if (iptv.length > 1) {
                cache.set(region, iptv);
            }
        }
    }
    return iptv;
}

async function catalog(region, url) {
    console.log(region)
    const metas = [];
    var iptv = await get_iptv(region, url).catch(error => console.error(error));
    for (let i = 0; i < iptv.length; i++) {
        metas.push({
            id: iptv[i].id,
            name: iptv[i].name,
            type: "tv",
            poster: iptv[i].poster,
            posterShape: 'landscape'
        });
    }
    return metas;
}

async function meta(id, url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    console.log(region, id)
    var iptv = (await get_iptv(region, url).catch(error => console.error(error)))[id];
    let meta = {
        name: iptv.name,
        id: iptv.id,
        name: iptv.name,
        type: "tv",
        background: iptv.background
    };
    return meta;
}

async function stream(id, url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    var iptv = (await get_iptv(region, url).catch(error => console.error(error)))[id];

    let stream = {
        name: iptv.name,
        description: iptv.name,
        url: iptv.url
    };
    if (iptv["behaviorHints"]) {
        stream["behaviorHints"] = iptv["behaviorHints"];
    }
    return [stream];
}

module.exports = {
    catalog,
    meta,
    stream
};
