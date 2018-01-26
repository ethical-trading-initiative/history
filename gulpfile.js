'use strict';

var browserSync = require('browser-sync').create();
var data = require('gulp-data');
var filter = require('gulp-filter');
var flatten = require('gulp-flatten');
var fs = require('fs');
var gulp = require('gulp');
var gzip = require("gulp-gzip");
var imagemin = require('gulp-imagemin');
var modernizr = require('gulp-modernizr');
var nunjucksRender = require('gulp-nunjucks-render');
var postcss = require('gulp-postcss');
var realFavicon = require ('gulp-real-favicon');
var replace = require('gulp-replace');
var responsive = require('gulp-responsive');
var s3 = require("gulp-s3-publish");
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var sitemap = require('gulp-sitemap');
var sourcemaps = require('gulp-sourcemaps');
var svgSprite = require('gulp-svg-sprite');
var uglify = require('gulp-uglify');

// File where the favicon markups are stored
var FAVICON_DATA_FILE = './dist/favicons/faviconData.json';

var postcssProcessors = [
  require('postcss-will-change')(), // must be before autoprefixer
  require('autoprefixer')({browsers: ['last 2 versions', 'Firefox ESR']}),
  require('postcss-vmin')()
];

// Primary task aliases
// -----------------------------------------------------------------------------

gulp.task('default', ['watch']);

gulp.task('build', [
  'imagemin',
  // 'gallery-images',
  'entry-lead-images',
  // 'imagemin:sprite',
  'svg-sprite',
  'sass:prod',
  'js:prod',
  'html',
  'sitemap',
  'modernizr'
]);

gulp.task('init', [
  'copyOtherFilesToDist',
  'generate-favicon'
]);

// Tasks
// -----------------------------------------------------------------------------

gulp.task('deploy', function () {
  var aws = JSON.parse(fs.readFileSync('./aws.json'));
  var options = { gzippedOnly: true };
  return gulp.src(['./dist/**/*','!**/*.map'])
    .pipe(gzip())
    .pipe(s3(aws, options));
});

gulp.task('watch', function () {

  browserSync.init({
    server: "./dist"
  });

  gulp.watch('./src/sass/**/*.scss', ['sass:dev']);
  gulp.watch('./src/js/**/*.js', ['js:dev']);
  gulp.watch('./src/**/*.+(html|nunjucks|njk)', ['html']);
  gulp.watch('./src/**/*.json', ['html']);
});

gulp.task('html', function() {
  gulp.src('src/pages/**/*.+(html|nunjucks|njk)')
    .pipe(data(function() {
        return require('./src/data.json')
      }))
    .pipe(nunjucksRender({
        path: ['src/templates']
      }))
    .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
    .pipe(gulp.dest('dist'))
    browserSync.reload();
});

gulp.task('sitemap', function () {
  gulp.src(['dist/**/*.html', '!dist/error.html'], {
      read: false
    })
    .pipe(sitemap({
      siteUrl: 'https://history.ethicaltrade.org'
    }))
    .pipe(gulp.dest('./dist'));
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
    .pipe(browserSync.stream());
});

gulp.task('imagemin', function () {
  // Exclude certain directories that are handled specifically in other Gulp tasks.
  gulp.src([
    'src/images/**/*',
    '!src/images/sprite',
    '!src/images/sprite/**/*',
    '!src/images/bitmap/gallery-items/**/*',
    '!src/images/bitmap/entry-lead/**/*'
  ])
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

// gulp.task('imagemin:sprite', function () {
//   gulp.src('src/images/sprite/**/*.svg')
//     .pipe(imagemin([
//       imagemin.svgo({plugins: [
//         { removeViewBox: false }, {
//           removeAttrs: {
//             attrs: ['(stroke|fill)']
//           }
//         }
//       ]})
//     ]))
//     .pipe(gulp.dest('dist/images/sprite'));
// });

// Try SVGO settings in the browser:
// https://jakearchibald.github.io/svgomg
gulp.task('svg-sprite', function() {
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
    browserSync.reload();
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
        'svgfilters',
        'touchevents'
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
    masterPicture: './src/images/bitmap/favicon/favicon_source.png',
    dest: './dist/favicons',
    iconsPath: '/favicons',
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

  gulp.src('./node_modules/jquery/dist/jquery.slim.min.js')
    .pipe(gulp.dest('./dist/vendor/jquery'));

  // gulp.src('./node_modules/@fancyapps/fancybox/dist/**/*.min.*')
  //   .pipe(gulp.dest('./dist/vendor/@fancyapps/fancybox'));

  gulp.src('./node_modules/scrollmagic/scrollmagic/minified/**/*.min.*')
    .pipe(gulp.dest('./dist/vendor/scrollmagic'));

  gulp.src('./node_modules/gsap/ScrollToPlugin.js')
    .pipe(gulp.dest('./dist/vendor/gsap'));

  gulp.src('./node_modules/svgxuse/svgxuse.min.js')
    .pipe(gulp.dest('./dist/vendor/svgxuse'));

  gulp.src('./src/robots.txt')
    .pipe(gulp.dest('./dist'));

  gulp.src('./src/manifest.json')
    .pipe(gulp.dest('./dist'));

});

gulp.task('gallery-images', function () {
  return gulp.src('src/images/bitmap/gallery-items/**/*.{jpg,jpeg}')
    .pipe(responsive({
      '*': [
        {
          // Thumbnail images.
          rename: { suffix: '-thumb' },
          height: 60,
          quality: 85
        },{
          // Large, higher quality images.
          quality: 100,
          width: 1000
        }
      ]}, {
      // Global configuration for all images
      format: 'jpeg',
      progressive: true,
      withMetadata: false,
      withoutEnlargement: false
    }))
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images/bitmap/gallery-items'));
});

gulp.task('entry-lead-images', function () {
  return gulp.src('src/images/bitmap/entry-lead/**/*.{jpg,jpeg}')
    .pipe(responsive({
      '*': [
        {
          rename: { suffix: '-442w' },
          width: 442,
          quality: 85
        },{
          rename: { suffix: '-682w' },
          width: 682,
          quality: 85
        },{
          rename: { suffix: '-710w' },
          width: 710,
          quality: 85
        }
      ]}, {
      // Global configuration for all images
      format: 'jpeg',
      progressive: true,
      withMetadata: false,
      withoutEnlargement: false
    }))
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images/bitmap/entry-lead'));
});
