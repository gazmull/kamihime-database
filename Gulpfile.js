const gulp = require('gulp');
const sass = require('gulp-sass');
const ts = require('gulp-typescript');
const terser = require('gulp-terser');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const fs = require('fs-extra');

const tsProject = ts.createProject('tsconfig.json');

const paths = {
  dest: 'build',
  src: 'src',
  static: 'static',
};

const scssFiles = {
  dest: paths.static + '/css',
  src: paths.src + '/static/sass/**/*.scss',
};

const tsFiles = {
  dest: paths.dest,
};

const terserFiles = {
  dest: paths.dest,
  src: paths.dest + '/**/*.js',
};

const staticJsFiles = {
  dest: paths.dest + '/static/js',
  src: paths.src + '/static/js/**/*.js',
};

const viewsFiles = {
  dest: paths.dest + '/views',
  src: paths.src + '/views/**/*.pug',
};

gulp.task('sass', () => {
  return gulp.src(scssFiles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
    }).on('error', sass.logError))
    .pipe(gulp.dest(scssFiles.dest))
    .pipe(autoprefixer({ browsers: [ '>= 0.5%', 'last 5 versions' ] }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(scssFiles.dest));
});

gulp.task('ts', () => {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest(tsFiles.dest));
});

gulp.task('terser', () => {
  return gulp.src(terserFiles.src)
    .pipe(terser({
      keep_classnames: false,
      keep_fnames: false,
    }))
    .pipe(gulp.dest(terserFiles.dest));
});

gulp.task('static-js', () => {
  return gulp.src(staticJsFiles.src)
    .pipe(gulp.dest(staticJsFiles.dest));
});

gulp.task('views', () => {
  return gulp.src(viewsFiles.src)
    .pipe(gulp.dest(viewsFiles.dest));
});

gulp.task('serve', done => reload(done));

const commonTasks = [ 'static-js', 'views', 'sass', 'ts' ];

function clean () {
  return fs.remove(paths.dest).catch();
}

// function watch () {
//   return gulp.watch(paths.src, gulp.series(...commonTasks));
// }

gulp.task('default', gulp.series(clean, ...commonTasks, 'terser'));
// gulp.task('watch', watch);
gulp.task('build', gulp.series(clean, ...commonTasks));
