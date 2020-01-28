"use strict"

var Jimp = require('jimp')
const express = require('express')
const querystring = require('querystring');
const app = express()
const port = 8080

app.disable('x-powered-by')

app.get('/health', (req, res) => {
    res.send("ok");
});

app.use('/image/fetch/:operations/', (req, res) => {

    let ops = req.params.operations.split(',')
    let url = req.query.image

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
})

app.listen(port, () => console.log(`Serving on: ${port}!`))
