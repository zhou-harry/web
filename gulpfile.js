var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();

var nodemon = require('gulp-nodemon');


var DEST = 'build/';
var cookies = {};

// TODO: Maybe we can simplify how sass compile the minify and unminify version
var compileSASS = function (filename, options) {
    return sass('src/scss/*.scss', options)
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(concat(filename))
        .pipe(gulp.dest(DEST + '/css'))
        .pipe(browserSync.stream());
};

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

gulp.task('browser-sync', ['nodemon'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:5000",
        port: 7000,
        open: false
    });
});
gulp.task('nodemon', function (cb) {
    var started = false;
    return nodemon({
        script: 'app.js'
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
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
gulp.task('default', ['scripts', 'browser-sync', 'watch']);
