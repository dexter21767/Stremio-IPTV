var env = process.env.NODE_ENV ? 'beamup':'local';

var config = {}

switch (env) {
    case 'beamup':
		config.port = process.env.PORT
        config.local = "https://ryann-devv.github.io/Stremio-IPTV/manifest.json"
        break;

    case 'local':
		config.port = 11470
        config.local = "http://127.0.0.1:" + config.port;
        break;
}

module.exports = config;
