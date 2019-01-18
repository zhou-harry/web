
/**
 * 异步登录
 */
$("#login_form").submit(function (e) {
    e.preventDefault();
    var submit = true;
    // check all the rerquired fields
    // if (!validator.checkAll($(this))) {
    //     submit = false;
    // }
    if (submit) {
        $("#login_form").ajaxSubmit({
            url: "/api/home/login",
            type: "post",
            clearForm: false,
            timeout: 100000,
            beforeSubmit: function (data, jqform, options) {
                console.log("准备提交。。。");
            },
            success: function (data) {
                if (data.statusCode === "200") {
                    //验证成功
                    console.log("验证成功:"+JSON.stringify(data.data));
                    window.location.href="index.html"
                } else {
                    //验证失败
                    alert(data.message);
                }
            },
            error: function (response) {
                alert(JSON.stringify(response));
            }
        });
    }
})
