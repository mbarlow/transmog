"use strict"

var Jimp = require('jimp')
const querystring = require('querystring');

module.exports = (context, callback) => {

	function onBuffer(err, buffer) {
	  if (err) throw err;
	  callback(undefined, buffer);
	}

    // get the url path from env var
    // use a regex to extract the operations from the url
    // fix the url by removing leading slash and adding back a missing slash
    let path = process.env.Http_Path

    if (!path || path === "") {
        callback(1, {status: "bad request"})
    } else {

        let opsMatch = path.match(/fetch\/((\w+),?)+\/http/)[0].split('/')[1]
        let ops = opsMatch.split(',')
        let url = path.split(opsMatch)[1].substr(1).replace(':/',"://")

        // map the string array into an operations log object of param -> value
        const oplog = {}
        ops.map(item => {
            let param = item.split('_')[0]
            let value = item.split('_')[1]
            oplog[param] = value
        })

        // use jimp to retrieve the image at the url, then run a crop operation (if specified in the operations list)
        Jimp.read({
            url: url,
            headers: {}
        })
        .then(image => {
            for (var key in oplog) {
                if (oplog.hasOwnProperty(key)) {
                    let param = key
                    let val = oplog[param]
                    switch (param) {
                        case 'c':
                            switch (val) {
                                case 'fill':
                                    image.crop(Number(oplog.x), Number(oplog.y), Number(oplog.w), Number(oplog.h))
                                    break;
                            }
                            break;
                    }
                }
            }
            image.getBuffer(Jimp.MIME_JPEG, onBuffer);
        })
        .catch(err => {
            callback(err, {status: "error"});
        });
    
    }
}
