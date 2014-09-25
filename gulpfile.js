'use strict';
// generated on 2014-09-22 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');
var views_production_js = '.tmp/view.production.js';

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
        .pipe($.uglify())
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
    ], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'images', 'fonts', 'extras', 'views'], function () {
    var addsrc = require('gulp-add-src'),
        uglify = require('gulp-uglify'),
        concat = require('gulp-concat');

    return gulp.src('dist/scripts/vendor.js')
        .pipe(addsrc(views_production_js))
        .pipe(uglify())
        .pipe(concat('vendor.js'))
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

gulp.task('test', ['styles', 'slink'], function () {
  return gulp.src(['test/**/*.html', '!test/bower_components/**/*.html'])
      .pipe(mochaPhantomJS());
});

/* gulp-shell plugin */
var shell = require('gulp-shell');

gulp.task('slink', shell.task([
  'ln -sf ../app/bower_components test/bower_components',
  'ln -sf ../app/scripts test/scripts',
  'ln -sf ../app/styles test/styles',
]));

/* can-compile plugin for canjs */
var compilerGulp = require('can-compile/gulp.js');
// Creates a task called 'ejs-views'
compilerGulp.task('views', {
  version: '2.1.3',     // canjs version
  src: ['app/views/**/*.ejs'],
  out: views_production_js,
  tags: []
}, gulp);
