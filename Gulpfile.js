const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const fs = require('fs-extra');
const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');

const backendTs = ts.createProject('tsconfig.json');
const staticTs = ts.createProject('src/static/tsconfig.json');
const nodemonConfig = require('./.nodemon.json');

const paths = {
  dist: './dist',
  src: './src',
  srcStatic: './src/static',
  static: './static'
};

const scssFiles = {
  dist: paths.static + '/css',
  src: paths.src + '/static/sass/**/*.scss'
};

const backendFiles = { dest: paths.dist };

const staticFiles = {
  dist: paths.dist + '/static/js',
  src: paths.srcStatic + '/ts/**/*.ts'
};

const terserFiles = {
  dest: paths.dist,
  src: paths.dist + '/**/*.js'
};

const viewsFiles = {
  dest: paths.dist + '/views',
  src: paths.src + '/views/**/*.pug'
};

gulp.task('styles', () => {
  return gulp.src(scssFiles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest(scssFiles.dist))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(scssFiles.dist))
    .pipe(browserSync.stream());
});

gulp.task('lint', () => {
  return gulp.src(paths.src)
    .pipe(tslint({ configuration: './.tslint.js', fix: process.argv.includes('--fix') }))
    .pipe(tslint.report());
});

gulp.task('backend-ts', () => {
  return backendTs.src()
    .pipe(backendTs())
    .js.pipe(gulp.dest(backendFiles.dest));
});

gulp.task('static-ts', () => {
  return staticTs.src()
    .pipe(staticTs())
    .js.pipe(gulp.dest(staticFiles.dist));
});

gulp.task('views', () => {
  return gulp.src(viewsFiles.src)
    .pipe(gulp.dest(viewsFiles.dest));
});

gulp.task('terser', () => {
  return gulp.src(terserFiles.src)
    .pipe(terser({
      keep_classnames: false,
      keep_fnames: false
    }))
    .pipe(gulp.dest(terserFiles.dest));
});

gulp.task('nodemon', done => {
  let started = false;

  return nodemon(nodemonConfig)
    .on('start', () => {
      if (!started) {
        started = true;
        done();
      }
    })
    .on('restart', () => setTimeout(() => browserSync.reload(), 5e3));
});

gulp.task('serve', gulp.series('nodemon', () => {
  browserSync.init({
    ghostMode: true,
    proxy: 'http://localhost:80',
    port: 3000,
    reloadDelay: 1e3
  });
}));

const commonTasks = [ clean, 'lint', 'backend-ts', 'static-ts', 'views', 'styles' ];

function clean () {
  return fs.remove(paths.dist);
}

function reload (done) {
  browserSync.reload();
  done();
}

function watch () {
  gulp.watch(
    [ `${paths.srcStatic}/ts/**/*.ts`, viewsFiles.src ],
    gulp.series('static-ts', 'views', reload)
  );
  gulp.watch(`${paths.srcStatic}/sass/**/*.scss`, gulp.series('styles'));
  gulp.watch([ `${paths.src}/**/*.ts`, '!**/static*/**' ], gulp.series('backend-ts', 'nodemon', reload));
}

gulp.task('default', gulp.series(...commonTasks, 'terser'));
gulp.task('watch', gulp.parallel('serve', watch));
gulp.task('build', gulp.series(...commonTasks));
