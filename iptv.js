const m3u = require('m3u8-reader');
const axios = require('axios').default;
const regions = require('./regions.json');

async function getm3u(region) {
url = regions[region].url;
return await m3ulist(url,region)
}
async function m3ulist(url,region) {
    if (url) {
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
    } else {
        return;
    }
}

async function catalog(region,url) {
	if(region == "cusiptv")
	{
		return (await(m3ulist(url,region)));
	}else{
    return (await(getm3u(region)));
	}
}

async function meta(id,url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
    console.log('region:',region,'id:', id,'url:',url);
	
	if(region == "cusiptv")
	{
		console.log('region == "cusiptv"');
		return (await(m3ulist(url,region)))[id];
	}
	
	else{
	console.log('region != "cusiptv"');
    return (await(getm3u(region)))[id];
	}
}

async function stream(id,url) {
    var region = id.split(":")[1];
    id = id.split(":")[2];
	
	if(region == "cusiptv")
	{
		console.log('region == "cusiptv"');
		var iptv =  (await(m3ulist(url,region)))[id];
	}
	
	else{
	console.log('region != "cusiptv"');
    var iptv = (await(getm3u(region)))[id];
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
