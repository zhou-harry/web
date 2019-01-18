/*

/!**
 * 异步登录
 *!/
$("#login_form").submit(function (e) {
    e.preventDefault();
    var submit = true;
    // check all the rerquired fields
    // if (!validator.checkAll($(this))) {
    //     submit = false;
    // }
    if (submit) {
        $(this).ajaxSubmit({
            url: "/login",
            type: "post",
            clearForm: false,
            timeout: 100000,
            // target:'#rfFrame',
            beforeSubmit: function (data, jqform, options) {
                console.log("准备提交。。。");
            },
            success: function (body) {
                if (body.statusCode === "200") {
                    //验证成功
                    console.log("验证成功:"+JSON.stringify(body.data));
                    req.session.user = body.data; // 登录成功，设置 session
                    res.redirect('/index');
                } else {
                    //验证失败
                    alert(body.message);
                }
            },
            error: function (response) {
                alert(JSON.stringify(response));
            }
        });
    }
})
*/
