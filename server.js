// require serverless version
const app = require('./index.js')

// create local server
app.listen((process.env.PORT || 63355), function () {
    console.log(`Addon active on port ${process.env.PORT || 63355} .`);
    console.log(`HTTP addon accessible at: http://127.0.0.1:${process.env.PORT || 63355}/manifest.json`);
});