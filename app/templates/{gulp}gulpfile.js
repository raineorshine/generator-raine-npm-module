var gulp          = require('gulp')
var browserify    = require('browserify')
var livereload    = require('gulp-livereload')
var notify        = require('gulp-notify')
var sourcemaps    = require('gulp-sourcemaps')
var source        = require('vinyl-source-stream')
var buffer        = require('vinyl-buffer')
>> if(web) {
var es            = require('event-stream')
var autoprefixer  = require('gulp-autoprefixer')
var concat        = require('gulp-concat')
var minifycss     = require('gulp-minify-css')
var plumber       = require('gulp-plumber')
var rename        = require('gulp-rename')
var sass          = require('gulp-sass')
var stylus        = require('gulp-stylus')
var nib           = require('nib')
>> }
>> if(web && isStatic) {
var jade          = require('gulp-jade')
>> }
var notifyOnError = notify.onError("<%= error.message %>")

var config = {
  >> if(web) {
  srcCss: 'src/style/**/*.css',
  srcStylus: 'src/style/**/*.styl',
  srcSass: 'src/style/**/*.s*ss',
  destCss: 'public/style',
  cssConcatTarget: 'main.css',
  >> }
  >> if(web && isStatic) {
  srcViews: 'src/*.jade',
  destViews: 'public',
  >> }
  srcScripts: 'src/script/**/*.js',
  srcAppScript: 'src/script/app.js',
  destScripts: 'public/script',
  destBundle: 'bundle.js'
}

>> if(web) {
gulp.task('styles', function() {

  var css = gulp.src(config.srcCss)

  var stylusStream = gulp.src(config.srcStylus)
    .pipe(plumber({ errorHandler: notifyOnError }))
    .pipe(stylus({ use: [nib()] }))

  var sassStream = gulp.src(config.srcSass)
    .pipe(plumber({ errorHandler: notifyOnError }))
    .pipe(sass({ indentedSyntax: true }))

  return es.merge(css, sassStream, stylusStream)
    .pipe(concat(config.cssConcatTarget))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest(config.destCss))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest(config.destCss))
    .pipe(livereload({ auto: false }))
})
>> }

>> if(web && isStatic)
gulp.task('views', function () {
  return gulp.src(config.srcViews)
    .pipe(jade())
    .pipe(gulp.dest(config.destViews))
    .pipe(livereload({ auto: false }))
})
>> }

gulp.task('scripts', function () {
  return browserify(config.srcAppScript)
    .bundle()
    .pipe(source(config.destBundle))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.destScripts))
    .pipe(livereload({ auto: false }))
})

gulp.task('watch', function () {
  >> if(web) {
  gulp.watch([config.srcStylus, config.srcSass], ['styles'])
  >> }
  >> if(web && isStatic)
  gulp.watch(config.srcViews, ['views'])
  >> }
  gulp.watch(config.srcScripts, ['scripts'])
})

>>
var tasks = ['scripts']
if(web) tasks.push('styles')
if(web && isStatic) tasks.push('views')
<<

gulp.task('default', ['styles', 'scripts', 'views'])
