const m3u = require('m3u8-reader');
const axios = require('axios').default;
const regions = require('./regions.json');

async function getm3u(region) {

    url = regions[region].url;
    console.log(url)
    var m3u8 = (await axios.get(url)).data;
    var array = m3u(m3u8);

    var arr = [];
    var n = 0;
    for (i = 0; i < array.length; i = i + 2) {
        var name = Object.keys(array[i].EXTINF)[1];
        var url = array[(i + 1)];
        arr.push({
            id: "iptv_id:" + region + ":" + n,
            name: name,
            type: "tv",
            url: url
        });
        n++;
    }
    return arr
}

async function catalog(region) {
    return (await(getm3u(region)));
}

async function meta(id) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    console.log(region, id);
    return (await(getm3u(region)))[id];
}

async function stream(id) {
    var region = id.split(":")[1];
    id = id.split(":")[2];

    var iptv = (await(getm3u(region)))[id];

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
