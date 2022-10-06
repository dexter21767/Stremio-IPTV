var regions = require('./regions')

for (let region in regions){
    regions[region].id = region
}
console.log(regions)
var json = JSON.stringify(regions);
var fs = require('fs');
fs.writeFile('regions.json', json, 'utf8', function(err) {
    if (err) throw err;
    console.log('complete');
    }
);
