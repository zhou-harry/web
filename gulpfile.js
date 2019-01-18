var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();
//引入代理模块
var proxy = require('http-proxy-middleware');

var DEST = 'build/';


// TODO: Maybe we can simplify how sass compile the minify and unminify version
var compileSASS = function (filename, options) {
    return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST + '/css'))
        .pipe(browserSync.stream());
};
var apiProxy = proxy("/api",
    {
        target: 'http://localhost:8081',
        changeOrigin: true,
        pathRewrite: {
            '^/api': '/' // rewrite path
        },
        onProxyReq(proxyReq, req, res) {
            // add custom header to request
            // proxyReq.setHeader('x-added', 'foobar');
            // or log the req
            console.log("add custom header to request");
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

gulp.task('scripts', function () {
    return gulp.src([
        'src/js/helpers/*.js',
        'src/js/*.js',
    ])
        .pipe(concat('custom.js'))
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(browserSync.stream());
});

gulp.task('sass', function () {
    return compileSASS('custom.css', {});
});

gulp.task('sass-minify', function () {
    return compileSASS('custom.min.css', {style: 'compressed'});
});

gulp.task('browser-sync', function () {
    browserSync.init({
        server: {
            baseDir: './',
            middleware: [apiProxy]
        },
        startPath: './production/login.html'
    });
});

gulp.task('watch', function () {
    // Watch .html files
    gulp.watch('production/*.html', browserSync.reload);
    // Watch .js files
    gulp.watch('src/js/*.js', ['scripts']);
    // Watch .scss files
    gulp.watch('src/scss/*.scss', ['sass', 'sass-minify']);
});

// Default Task
gulp.task('default', ['browser-sync', 'watch', 'scripts']);
