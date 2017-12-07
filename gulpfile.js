'use strict';

var connect = require('gulp-connect');
var filter = require('gulp-filter');
var flatten = require('gulp-flatten');
var fs = require('fs');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var modernizr = require('gulp-modernizr');
var nunjucksRender = require('gulp-nunjucks-render');
var postcss = require('gulp-postcss');
var realFavicon = require ('gulp-real-favicon');
var replace = require('gulp-replace');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var sourcemaps = require('gulp-sourcemaps');
var svgSprite = require('gulp-svg-sprite');
var uglify = require('gulp-uglify');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'dist/favicons/faviconData.json';

var postcssProcessors = [
  require('postcss-will-change')(), // must be before autoprefixer
  require('autoprefixer')({browsers: ['last 2 versions', 'Firefox ESR']}),
  require('postcss-vmin')()
];

// Primary task aliases
// -----------------------------------------------------------------------------

gulp.task('default', ['watch', 'connect']);

gulp.task('build', [
  'imagemin',
  // 'imagemin:sprite',
  // 'svg-sprite',
  'sass:prod',
  'js:prod',
  'nunjucks',
  'modernizr'
]);

gulp.task('init', [
  'copyOtherFilesToDist'
]);

// Tasks
// -----------------------------------------------------------------------------

gulp.task('watch', function () {
  gulp.watch('./src/sass/**/*.scss', ['sass:dev']);
  gulp.watch('./src/js/**/*.js', ['js:dev']);
  gulp.watch('./src/**/*.+(html|nunjucks|njk)', ['nunjucks']);
});

gulp.task('nunjucks', function() {
  gulp.src('src/pages/**/*.+(html|nunjucks|njk)')
  .pipe(nunjucksRender({
      path: ['src/templates']
    }))
  .pipe(gulp.dest('dist'))
  .pipe(connect.reload());
});

gulp.task('sass:prod', function () {
  gulp.src('./src/sass/*.scss')
    .pipe(sassGlob())
    .pipe(sass({
      outputStyle: 'compressed',
      errLogToConsole: true
    }))
    .pipe(postcss(postcssProcessors))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('sass:dev', function () {
  gulp.src('./src/sass/*.scss')
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'nested',
      errLogToConsole: true
    }))
    .pipe(postcss(postcssProcessors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(connect.reload());
});

gulp.task('connect', function() {
  connect.server({
    livereload: true
  });
});

gulp.task('imagemin', function () {
  // gulp.src(['src/images/**/*', '!src/images/sprite/**/*.svg'])
  // Grab everything for now :)
  gulp.src(['src/images/**/*'])
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

gulp.task('imagemin:sprite', function () {
  gulp.src('src/images/sprite/**/*.svg')
    .pipe(imagemin([
      imagemin.svgo({plugins: [
        { removeViewBox: false }, {
          removeAttrs: {
            attrs: ['(stroke|fill)']
          }
        }
      ]})
    ]))
    .pipe(gulp.dest('dist/images/sprite'));
});

// Try SVGO settings in the browser:
// https://jakearchibald.github.io/svgomg
gulp.task('svg-sprite', function() {
  gulp.src('dist/images/sprite/**/*.svg')
    .pipe(svgSprite({
      mode: {
        symbol: true
      }
    }))
    .pipe(gulp.dest('dist/sprites'));
});

gulp.task('js:dev', function () {
  gulp.src('src/js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(flatten())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload());
});

gulp.task('js:prod', function () {
  gulp.src('src/js/**/*.js')
    .pipe(uglify())
    .pipe(flatten())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('modernizr', function() {
  gulp.src('dist/css/**/*.css')
    .pipe(modernizr({
      options: ['setClasses'],
      tests: [
        // Used to detect < IE10.
        // See unsupported-browser.js.
        'svgfilters'
      ]
    }))
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
});

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
  realFavicon.generateFavicon({
    masterPicture: 'src/images/png/favicon_source.png',
    dest: 'dist/favicons',
    iconsPath: '/',
    design: {
      ios: {
        pictureAspect: 'backgroundAndMargin',
        backgroundColor: '#ffffff',
        margin: '0%',
        assets: {
          ios6AndPriorIcons: true,
          ios7AndLaterIcons: true,
          precomposedIcons: true,
          declareOnlyDefaultIcon: false
        },
        appName: 'ETI'
      },
      desktopBrowser: {},
      windows: {
        pictureAspect: 'whiteSilhouette',
        backgroundColor: '#da532c',
        onConflict: 'override',
        assets: {
          windows80Ie10Tile: true,
          windows10Ie11EdgeTiles: {
            small: true,
            medium: true,
            big: true,
            rectangle: true
          }
        },
        appName: 'ETI'
      },
      androidChrome: {
        pictureAspect: 'shadow',
        themeColor: '#8b032c',
        manifest: {
          name: 'ETI',
          display: 'standalone',
          orientation: 'notSet',
          onConflict: 'override',
          declared: true
        },
        assets: {
          legacyIcon: false,
          lowResolutionIcons: false
        }
      },
      safariPinnedTab: {
        pictureAspect: 'silhouette',
        themeColor: '#8b032c'
      }
    },
    settings: {
      compression: 5,
      scalingAlgorithm: 'Mitchell',
      errorOnImageTooSmall: false
    },
    versioning: {
      paramName: 'v',
      paramValue: '8jeqqoz0Ye'
    },
    markupFile: FAVICON_DATA_FILE
  }, function() {
    done();
  });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
//
// NOTE: This is a slightly revised task when compared to what is suggested by
// http://realfavicongenerator.net/favicon/gulp. This task creates a file from
// scratch and completely overwrites it on subsequent runs.
// Source: https://goo.gl/PaHp7u
gulp.task('inject-favicon-markups', function() {
  require('fs').writeFileSync('templates/system/favicons.html.twig', '');
  gulp.src([ 'templates/system/favicons.html.twig'])
    .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    .pipe(replace('href="/', 'href="/my-theme/'))
    .pipe(replace('content="/', 'content="/my-theme/'))
    .pipe(gulp.dest('templates/system/'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
  var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
  realFavicon.checkForUpdates(currentVersion, function(err) {
    if (err) {
      throw err;
    }
  });
});

// Copy other package files to dist whose source needs to be targeted
// specifically.
gulp.task('copyOtherFilesToDist', function() {
  gulp.src('./node_modules/@ethical-trading-initiative/base-sass/dist/css/reset.css')
    .pipe(gulp.dest('./dist/vendor/@ethical-trading-initiative/base-sass'));
});
