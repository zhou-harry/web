var express = require('express');
var app = express();
var path = require('path');
var proxy = require('http-proxy-middleware');//引入代理模块
var session = require('express-session');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false})
var ajax = require('ajax-request');
// var routes = require('./routes')(app);
var server="http://localhost:8081/";

/*静态文件路由*/
app.use(express.static('production'));
app.use(express.static('vendors'));
app.use(express.static(path.join(__dirname, 'build')));
/*将jade模板变成html模板*/
app.set('views', path.join(__dirname, 'production'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

/*代理*/
var apiProxy = proxy("/api",
    {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: {
            '^/api': '/' // rewrite path
        },
        onProxyReq(proxyReq, req, res) {
            console.log("proxy requeset");
        },
        onProxyRes(proxyRes, req, res) {
            console.log("proxy response");
        },
        onError(err, req, res) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            })
            res.end(
                'Something went wrong. '
            )
        }
    }
);
/**
 * Add the proxy to express
 */
app.use('/api', apiProxy)

/*使用 session 中间件*/
app.use(session({
    secret :  'secret', // 对session id 相关的cookie 进行签名
    resave : true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie : {
        maxAge : 1000 * 60 * 30, // 设置 session 的有效时间，单位毫秒
    },
}));
/*cookie*/
app.use(cookie());
/*监听端口*/
app.listen(5000);


//======================================================================================
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/production/login.html'));
});
app.get('/index', function (req, res) {
    res.render('index1',{ title: '测试的标题',message:'这是一个消息内容'});
});;

//登录
app.post("/login", urlencodedParser, function (req, response) {
    var user = {
        userId: req.body.userId,
        password: req.body.password,

    }
    console.log("主页 POST 请求:"+JSON.stringify(user));
    ajax({
        url: server+"home/login",
        method: "POST",
        data: user
    }, function (err, res, body) {
        var obj = JSON.parse(body);
        console.log(obj);
        if ("200" === obj.statusCode) {
            req.session.user = obj.data;
            response.render('index1', obj.data);
        } else {
            console.log(obj.message);
            response.redirect("/");
        }
    });


})