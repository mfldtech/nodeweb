const http = require('http'),
    https = require('https'),
    dotenv = require('dotenv').config(),
    buffer = require('buffer'),
    fs = require('fs'),
    memfs = {
        load: async function(path) {
            return new Promise((resolve,reject) => {
                if(typeof path === 'string' && fs.existsSync(path) && fs.statSync(path).size < buffer.constants.MAX_LENGTH) {
                    this[path] = fs.readFileSync(path);
                    resolve();
                } else {
                    reject();
                }
            });
        }, unload: async function(object) {
            return new Promise((resolve,reject) => {
                if(typeof object === 'object' && Buffer.isBuffer(object)) {
                    fs.writeFileSync(Object.keys(memfs).find(key => memfs[key] === object),object);
                    delete this[Object.keys(memfs).find(key => memfs[key] === object)];
                    resolve();
                } else {
                    reject();
                }
            })
        }, recursive: async function(path) {

        }
    };
memfs.load('www/logo.svg').then(() => {
    console.log(memfs);
    memfs.unload(memfs['www/logo.svg']).then(() => {
        console.log(memfs);
    })
});