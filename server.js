var express = require("express");
var app = express();

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: false})


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
            req.session.user=obj.data;
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
                menus:obj.data
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
app.get("/dashboard",urlencodedParser,function (req, res) {
    res.render('dashboard',{count:'1500'});
})
/**
 *错误页面
 */
app.get("/error",urlencodedParser,function (req, res) {
    res.render('error',{errornumber:'403'});
})
/**
 * 用户资料
 */
app.get("/profile",urlencodedParser,function (req, res) {
    ajax({
        url: server + "user/getTags?userid="+req.session.user.userId,
        method: "GET",
        headers: {
            Authorization: req.session.sessionToken
        }
    }, function (err, response, body) {
        var obj = JSON.parse(body);
        console.log("返回：" + JSON.stringify(obj));
        if ("200" === obj.statusCode) {
            //跳转主页
            res.render('profile', {
                user: req.session.user,
                tags:obj.data
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
app.get("/userlist",urlencodedParser,function (req, res) {
    res.render('user_list',{errornumber:'403'});
})

module.exports = app;