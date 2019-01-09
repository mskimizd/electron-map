var http = require("http");
var url = require("url");
var querystring = require('querystring');

var myServer  = exports;


var hasBody = function(req){
    return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
}
var mime = function(req){
    var str = req.headers['content-type'] || '';
    return str.split(";")[0];
}
var handle = function(req, res, proc){
    if(hasBody(req)){ // form data & request payload
        var buffers = [];var size=0;
        req.on('data', function(chunk){
            buffers.push(chunk);
            size += chunk.length;
        });
        req.on('end', function(){
            req.rawBody = Buffer.concat(buffers, size).toString();
            if(mime(req) === 'application/x-www-form-urlencoded'){
                req.body = querystring.parse(req.rawBody);
            }else if(mime(req) === 'application/json'){
                try {
                    req.body = JSON.parse(req.rawBody);
                } catch (error) {
                    res.writeHead(400);
                    res.end('invalid JSON');
                    return;
                }
            }
            proc(req, res);
        });
    }else{ // query string
    	let uri = url.parse(req.url,true);
    	let param = uri.query;
    	req.body = uri.query;
    	proc(req, res);
    }
}

myServer.init = (callback) => {
	this.instance = http.createServer(function(req,res){
		let uri = url.parse(req.url,true);
        handle(req, res, function(req, res){
        	callback(uri.pathname, req.body, req, res);
        });
	});
}

myServer.response = (res, type, data) => {
	if(type == "normal"){
	    res.writeHead(200,{'Content-type':"application/json","Access-Control-Allow-Origin":"*"});
	    res.end(JSON.stringify(data));
	}else if(type == "jpeg"){
		res.setHeader("Content-Type", "image/jpeg");
        res.writeHead(200,"OK");
        res.write(data, "binary");
        res.end();
	}else if(type == "file"){
        res.writeHead(200,"OK");
        res.write(data, "binary");
        res.end();
	}else if(type == "error"){
        res.writeHead(500,"Server Error");
        res.end();
	}
}

myServer.start = (port, callback) => {
	this.instance.listen(port, callback);
}
