const http = require('http'),
    https = require('https'),
    dotenv = require('dotenv').config(),
    buffer = require('buffer'),
    fs = require('fs'),
    path = require('path'),
    memfs = {
        load: async function(path) {
            return new Promise((resolve,reject) => {
                if(typeof path === 'string' && fs.existsSync(path) && fs.statSync(path).size < buffer.constants.MAX_LENGTH) {
                    this[path.replace(__dirname+'\\','').replace(/\\/g,'/')] = fs.readFileSync(path);
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
        }, recursive: async function(Path) {
            return new Promise((resolve,reject) => {
                var results = [];
                fs.readdir(Path,(err,contents) => {
                    if(err) reject(err);
                    var pending = contents.length;
                    if(!pending) resolve(results);
                    contents.forEach((file) => {
                        file = path.resolve(Path,file);
                        fs.stat(file,(err,stat) => {
                            if(err) reject(err);
                            if(stat && stat.isDirectory()) {
                                this.recursive(file).then((value) => {
                                    results = results.concat(value);
                                    if(!--contents.length) resolve(results);
                                });
                            } else if(stat.size < buffer.constants.MAX_LENGTH) {
                                results.push(file);
                                if(!--pending) resolve(results);
                            } else {
                                reject('Buffer overflow! Max buffer length is '+buffer.constants.MAX_LENGTH);
                            }
                        })
                    })
                })
            })
        }, rescursiveLoad: function(Path) {
            memfs.recursive(Path).then((value) => {
                value.forEach((file) => {
                    memfs.load(file).then(() => {
                        console.log(memfs);
                    })
                })
            });
        }
    };

memfs.rescursiveLoad('www');
// let domain = RegExp('([a-z\-0-9]{2,63})\.([a-z\.]{2,5})$').exec(req.headers.host)[0];