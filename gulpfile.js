'use strict';
// generated on 2014-09-22 using generator-gulp-webapp 0.1.0

var gulp = require('gulp'),
    addsrc = require('gulp-add-src'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace');

var views_production_js = 'view.production.js';
var requirejs_production_js = 'requirejs.production.js';
var main_js = 'main.js';

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', ['less'], function () {
    return gulp.src('app/styles/**/*.css')
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('.tmp/styles'))
        .pipe($.size());
});

gulp.task('scripts', function () {
    return gulp.src('app/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html', ['styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src(['app/*.html'])
        .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
        .pipe(jsFilter)
        // .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'))
        .pipe($.size());
});

gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('dist/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', function () {
    return gulp.src([
        '.tmp',
        'dist',
        'app/styles/**/*.css',
        /* unit test soft links*/
        'test/bower_components',
        'test/scripts',
        'test/styles',
        'test/views'
    ], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras', 'requirejs', 'requirejs-views'], function () {
    return gulp.src('dist/scripts/main.js')
        .pipe(addsrc(['.tmp/' + requirejs_production_js, '.tmp/' + views_production_js]))
        .pipe(concat('main.js'))
        // add requirejs-views module 'views'
        .pipe(replace(/require\(\[(.*)\],/g, 'require([$1, "views"],'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app'))
        .use(connect.static('.tmp'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function () {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect'], function () {
    require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        'app/*.html',
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/views/**/*.ejs',
        'app/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    gulp.watch('app/less/**/*.less', ['styles']);
    // gulp.watch('app/styles/**/*.css', ['styles']);
    gulp.watch('app/scripts/**/*.js', ['scripts']);
    gulp.watch('app/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});

/* gulp-less plugin */
var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
    return gulp.src('app/less/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('app/styles'))
        .pipe($.size());
});

/* gulp-mocha-phantomjs plugin */
var mochaPhantomJS = require('gulp-mocha-phantomjs');

gulp.task('test', ['slink'], function () {
    return gulp.src([
        'test/index.html',
        '!test/bower_components/**/*.html'])
        .pipe(mochaPhantomJS());
});

/* gulp-shell plugin */
var shell = require('gulp-shell');

gulp.task('slink', ['styles'], shell.task([
    'ln -sf ../app/bower_components test/.',
    'ln -sf ../app/scripts test/.',
    'ln -sf ../app/styles test/.',
    'ln -sf ../app/views test/.',
]));

/* can-compile plugin for canjs */
var compile = require('can-compile/lib/index.js'),
    glob = require('glob');

gulp.task('views', function(done) {
    var options = {
        version: '2.1.3',     // canjs version
        out: '.tmp/' + views_production_js,
        tags: []
    }

    // Glob needs a string, but compiler needs an array.
    glob(['app/views/**/*.ejs'].join(), function (er, files) {
        compile(files, options, function(error, output, outfile) {
            // console.log('Finished compiling', outfile);
            done();
        });
    });
});

gulp.task('requirejs-views', ['views'], function() {
    var insert = require('gulp-insert');
    return gulp.src('.tmp/' + views_production_js)
        // create a requirejs module 'views'
        .pipe(insert.wrap('define("views", ["can", "can/view/ejs"], function (can) {', '});'))
        // replace ejs name from app_xxx_ejs to xxx_ejs
        .pipe(replace(/['"]app_([\w_]*_ejs)['"]/g, '"$1"'))
        .pipe(gulp.dest('.tmp'));
});

/* gulp-requirejs plugin for requirejs */
var rjs = require('gulp-requirejs');

gulp.task('requirejs', function() {
    rjs({
        baseUrl: 'app/scripts',
        out: requirejs_production_js,
        paths: {
            can: '../bower_components/canjs/amd/can'
        },
        name: 'main' // src: app/scripts/main.js
    })
        .pipe(gulp.dest('.tmp')); // pipe it to the output DIR
});
