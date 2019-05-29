"use strict"

var Jimp = require('jimp')
const querystring = require('querystring');

module.exports = handler

async function* handler(req, res) {

    try {
    // use a regex to extract the operations from the url
    // fix the url by removing leading slash and adding back a missing slash
    let path = req.path

    if (!path || path === "") {
        res.status(500).send("bad request")
    } else {

        let opsMatch = path.match(/fetch\/((\w+),?)+\/http/)[0].split('/')[1]
        let ops = opsMatch.split(',')
        let url = path.split(opsMatch)[1].substr(1)

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
            image.getBuffer(Jimp.MIME_JPEG, function(err, buffer) {
                res.set("Content-Type", Jimp.MIME_JPEG)
                res.send(buffer)
            });
        })
        .catch(e => {
            res.status(500).send(e.message);
        });
    }

    } catch (e) {
        res.status(500).send(e.message)
    }
}
