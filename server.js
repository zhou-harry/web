var express = require("express");
var app = express();
var path = require('path');
var ajax = require('ajax-request');

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false})

/*静态文件路由*/
app.use(express.static('production'));
app.use(express.static('vendors'));
app.use(express.static(path.join(__dirname, 'build')));
// /*将jade模板变成html模板*/
app.set('views', path.join(__dirname, 'production'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/production/login.html'));
});
app.get('/index', function (req, res) {
    res.render('index1',{ title: '测试的标题',message:'这是一个消息内容'});
});;

//  POST 请求
app.post("/login", urlencodedParser, function (req, response) {
    console.log("主页 POST 请求:");

    var user = {
        userId: req.body.username,
        password: req.body.password,

    }

    ajax({
        url: "api/home/login",
        method: "POST",
        data: user
    }, function (err, res, body) {
        // response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
        // response.write("Hello World:" + err + "/" + body);
        // response.end();
        console.log(err+"/"+body);
        res.send('返回： ' + body);
    });


})

module.exports = app;