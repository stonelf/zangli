// 云函数入口文件
//const cloud = require('wx-server-sdk')

//cloud.init()



var fs = require('fs');
var url = require('url');
var http = require('https');

// 云函数入口函数
exports.main = async(event, context) => {
  console.log("test get at server");
  return new Promise((resolve, reject) => {
    var p = event.path;
    var options = {
      host: 'mijisou.com',
      port: 443,
      path: p,
      headers: {
        
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'accept-encoding': 'gzip,deflate,br',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        'cache-control': 'no-cache',
        'pragma': 'no-cache',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36(KHTML, like Gecko) Chrome/72.0.3626.121 Safari/537.36'

      }
    };
    var size = 0;
    var chunks = [];
    http.get(options, function(res) {
      res.on('data', function(chunk) {
        size += chunk.length;
        chunks.push(chunk);

      }).on('end', function() {
        var data = Buffer.concat(chunks, size);
        console.log(data.toString())
        var s = data.toString().replace(/\s*<!-- <div class="result result-default"> -->\s*/g, "\1");
        var a = s.split("\1");
        console.log("length:"+a.length)
        
        var result = [],r;
        if (a.length > 1) {
          for (var i = 1; i < a.length; i++) {
            s = a[i];
            
            r = /noreferrer">(.*)<\/a>/;
            var title = r.test(s)?s.match(r)[1]:"";

            r = /<p class="result-content">(.*)<\/p>/;
            var content = r.test(s) ? s.match(r)[1] : "";

            r = /class="engine">(.*)<\/span>/;
            var engine = r.test(s) ? s.match(r)[1] : "";

            r = /result_header\"><a href=\"([^"]*)"/;
            var url = r.test(s) ? s.match(r)[1] : "";
            if (/proxyurl=/.test(url)) {
              url = url.replace(/^.*proxyurl=/, "");
            }

            result.push({
              'title': title,
              'content': content,
              'engine': engine,
              'url': decodeURIComponent(url)
            })
          }

          console.log(result);

        } else {
          console.log("无结果");
          resolve("无结果");
        }
        
        resolve(JSON.stringify(result));
      }).on('error', (e) => {
        reject(`problem with request: ${e.message}`);
      })
    });
  });
  /*
  const wxContext = cloud.getWXContext()

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
  */
}