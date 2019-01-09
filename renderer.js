// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const ipc = require('electron').ipcRenderer
const geoip = require('geoip-lite');
const server = require('./server.js');


const Utils = {};
Utils.isValidIP = function(ip){
    let reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    return reg.test(ip);
}
Utils.isValidLatlon = function(latlon){
    let latlonArr = latlon.split(",");
    let lat = "", lon="";
    if(latlonArr.length==2){
        lat = latlonArr[0].trim();
        lon = latlonArr[1].trim();
    }
    let regLon = /^-?(\d{1,2}(\.\d{1,5})?|1[0-7]\d(\.\d{1,5})?|180)$/;
    let regLat = /^-?(\d(\.\d{1,5})?|[1-8]\d(\.\d{1,5})?|90)$/;
    return regLat.test(lat) && regLon.test(lon);
}

// var ip = "207.97.227.239";
// var geo = geoip.lookup(ip);

// console.log(geo);


server.init((path, data, req, res)=>{
    if(path == "/getGeo"){
        try{
            let inputStr = data["inputStr"];

            let isIp = Utils.isValidIP(inputStr);
            let isLatlon = Utils.isValidLatlon(inputStr);
            let latlon = "";
            if(isIp){
                let geo = geoip.lookup(inputStr);
                if(geo == null){
                    server.response(res, "normal", {code: 301, data: ""});
                }
                latlon = geo.ll;
            }else if(isLatlon){
                latlon = inputStr.split(",");
            }

            server.response(res, "normal", {code: 200, data: latlon});
        }catch(err){
            server.response(res, "normal", {code: 300, data: ""});
        }
    }
});


server.start(3000, ()=>{
    console.log("后台启动")
});

