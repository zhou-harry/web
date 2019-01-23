var express = require('express');
var app = express();
var path = require('path');
var proxy = require('http-proxy-middleware');//引入代理模块
var session = require('express-session');
var cookie = require('cookie-parser');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false})
var ajax = require('ajax-request');
let multer = require('multer');
let upload = multer();
var FormData = require('form-data');
var http = require('http');

// var routes = require('./routes')(app);
var server = "http://localhost:8081/";

/*静态文件路由*/
app.use(express.static('production'));
app.use(express.static('vendors'));
app.use(express.static(path.join(__dirname, 'build')));
/*将jade模板变成html模板*/
app.set('views', path.join(__dirname, 'production'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');


/*代理*/
var apiProxy = proxy({
        target: server,
        changeOrigin: true,
        pathRewrite: {
            '^/api': '/' // rewrite path
        },
        onProxyReq(proxyReq, req, res) {
            proxyReq.setHeader('Authorization', req.session.sessionToken)
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
app.enable('trust proxy');
app.set("trust proxy", 1);

app.use(session({
    secret: 'secret', // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {
        maxAge: 1000 * 60 * 30, // 设置 session 的有效时间，单位毫秒
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

/**
 * 登录(账号验证)
 */
app.post("/login", urlencodedParser, function (req, res, next) {
    console.log("登录(账号验证):" + JSON.stringify(req.body));
    ajax({
        url: server + "home/login",
        method: "POST",
        data: req.body
    }, function (err, response, body) {
        var obj = JSON.parse(body);
        console.log("返回：" + JSON.stringify(obj));
        if ("200" === obj.statusCode) {
            req.session.sessionToken = obj.data.sessionToken;
            res.user = obj.data;
            next();
        } else {
            console.log(obj.message);
            res.redirect("/");
        }
    });
})
/**
 * 登录(获取用户信息)
 */
app.post("/login", urlencodedParser, function (req, res, next) {
    console.log("登录(获取用户信息)");
    ajax({
        url: server + "user/getInfo",
        method: "GET",
        headers: {
            Authorization: req.session.sessionToken
        }
    }, function (err, response, body) {
        var obj = JSON.parse(body);
        console.log("返回：" + JSON.stringify(obj));
        if ("200" === obj.statusCode) {
            res.info = obj.data;
            req.session.user = obj.data;
            next();
        } else {
            console.log(obj.message);
            res.redirect("/");
        }
    });
})
/**
 * 登录(加载菜单)
 */
app.post("/login", urlencodedParser, function (req, res, next) {
    console.log("登录(加载菜单)");
    ajax({
        url: server + "menu/initSides",
        method: "GET",
        headers: {
            Authorization: req.session.sessionToken
        }
    }, function (err, response, body) {
        var obj = JSON.parse(body);
        console.log("返回：" + JSON.stringify(obj));
        if ("200" === obj.statusCode) {
            //跳转主页
            res.render('index_', {
                user: res.user,
                info: res.info,
                menus: obj.data
            });
        } else {
            console.log(obj.message);
            res.redirect("/");
        }
    });
})
/**
 * 控制台
 */
app.get("/dashboard", urlencodedParser, function (req, res) {
    res.render('dashboard', {count: '1500'});
})
/**
 *错误页面
 */
app.get("/error", urlencodedParser, function (req, res) {
    res.render('error', {errornumber: '403'});
})
/**
 * 用户资料
 */
app.get("/profile", urlencodedParser, function (req, res) {
    ajax({
        url: server + "user/getTags?userid=" + req.session.user.userId,
        method: "GET",
        headers: {
            Authorization: req.session.sessionToken
        }
    }, function (err, response, body) {
        var obj = JSON.parse(body);
        console.log("返回：" + JSON.stringify(obj));
        if ("200" === obj.statusCode) {
            res.render('profile', {
                user: req.session.user,
                tags: obj.data
            });
        } else {
            console.log(obj.message);
            res.redirect("/");
        }
    });
})
/**
 * 用户列表
 */
app.get("/userlist", urlencodedParser, function (req, res) {
    ajax({
        url: server + "user/getInfos",
        method: "POST",
        data: {},
        headers: {
            Authorization: req.session.sessionToken
        }
    }, function (err, response, body) {
        var obj = JSON.parse(body);
        console.log("userlist返回：" + JSON.stringify(obj));
        if ("200" === obj.statusCode) {
            res.render('user_list', {items: obj.data});
        } else {
            console.log(obj.message);
            res.redirect("/");
        }
    });
})
/**
 * 批量注册
 */
app.get("/bulkRegistration", urlencodedParser, function (req, res) {
    res.render('register_list');
})
/**
 * 批量用户数据上传
 */
app.post("/uploadUsers", upload.any(), function (req, res) {
    console.log('get FormData files: ', req.files);
    req.headers['Authorization']= req.session.sessionToken;
    console.log('headers: ', req.headers);
    // ajax({
    //     url: server + "user/uploadUsers",
    //     method: "POST",
    //     data: req.files[0],
    //     headers: req.headers
    // }, function (err, response, body) {
    //     var obj = JSON.parse(body);
    //     console.log("uploadUsers返回：" + JSON.stringify(obj));
    //     if ("200" === obj.statusCode) {
    //
    //     } else {
    //         console.log(obj.message);
    //     }
    // });
    var form = new FormData();
    form.append(req.files);//'file'是服务器接受的key

    form.submit({
        host: server,
        path: 'user/uploadUsers',
        headers: req.headers
    }, function(err, httpResponse, body) {
        if (err) {
            return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:', body);
    });
})