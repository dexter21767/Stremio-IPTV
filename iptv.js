const parser = require('iptv-playlist-parser');
const axios = require('axios').default;
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const configCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const regions = require('./regions.json');

function ConfigCache(config) {
    if (config !== undefined) {

        var configuration = configCache.get(config);
        if (!configuration || configuration == undefined) {
            config = atob(config)
            var [providors, costume] = config.split('|');
            var costumeLists = {};
            providors = providors.split('=');
            costume = costume.split('=');

            if (providors && providors[1] && providors[1].length>1) {
                providors = providors[1].split(',');
                providors = [...new Set(providors)];
            } else {
                providors = null;
            }
            if (costume && costume[1] && costume[1].length>1) {
                costume = costume[1].split(',');
                for (let i = 0; i < costume.length; i++) {
                    let [id, name, url] = costume[i].split(":")
                    costumeLists[id] = { id: id, name: name, url: url };
                };
            } else {
                costume = null;
            }
            configuration = { providors: providors, costume: costume, costumeLists: costumeLists }
            if (configuration && configuration.length > 1) {
                console.log('caching config ...')
                configCache.set(config, configuration);
                console.log('done caching config')
            }
        } else {
            console.log('config already cached')
        }
        return configuration
    }
}

async function getm3u(region) {
    console.log("region", region);
    if (regions[region]) {
        url = regions[region].url;
        return await m3ulist(url, region)
    }
    return
}
function m3ulist(url, region) {
    if (url) {
        console.log(url)
        return axios.get(url, { timeout: 10000 }).then(data => {
            var array = (parser.parse(data.data)).items;
            var arr = [];
            for (i = 0; i < array.length; i++) {

                let tv = {
                    id: "stremio_iptv_id:" + region + ":" + i,
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
    if (url) {
        var iptv = cache.get(url);
        if (!iptv || iptv == undefined) {
            var iptv = await (m3ulist(url, region));
            if (iptv && iptv.length > 1) {
                console.log('caching ...')
                cache.set(url, iptv);
                console.log('done caching')
            }
        } else {
            console.log('already cached')
        }
    } else {
        var iptv = cache.get(region);
        if (!iptv || iptv == undefined) {
            var iptv = await (getm3u(region));
            if (iptv && iptv.length > 1) {
                console.log('caching ...')
                cache.set(region, iptv);
                console.log('done caching')
            }
        } else {
            console.log('already cached')
        }
    }
    return iptv;
}

async function catalog(region, url) {
    console.log("region", region, "url", url)
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

async function search(region, url,param) {
    try{
    console.log("region", region, "url", url)
    const metas = [];
    var iptv = await get_iptv(region, url).catch(error => console.error(error));
    if(!iptv) throw "error getting data";
    
    for (let i = 0; i < iptv.length; i++) {
        if(iptv[i].name.toLowerCase().match(param.toLowerCase())){
        metas.push({
            id: iptv[i].id,
            name: iptv[i].name,
            type: "tv",
            poster: iptv[i].poster,
            posterShape: 'landscape'
        });
        }
    }
    return metas;
}
catch(e){
    console.error(e);
}
}

async function meta(id, url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    console.log(region, id)
    var iptv = (await get_iptv(region, url).catch(error => console.error(error)))[id];
    let meta = {
        name: iptv.name,
        id: iptv.id,
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
        description: "IPTV by dexter21767",
        url: iptv.url
    };
    if (iptv["behaviorHints"]) {
        stream["behaviorHints"] = iptv["behaviorHints"];
    }else if(region.match("max")){
     //   stream["behaviorHints"]= {"notWebReady":true,"proxyHeaders":{"request":{'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"}}};
    }
    return [stream];
}

module.exports = {
    catalog,
    search,
    meta,
    stream,
    ConfigCache
};
