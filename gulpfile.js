const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');

const buildDir = 'build';

gulp.task('sass', () => {
  gulp.src('./styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(`./${buildDir}`));
});
gulp.task('sass:watch', () => {
  gulp.watch('./styles/**/*.scss', ['sass']);
});

gulp.task('src', () => {
  gulp.src('manifest.json')
    .pipe(gulp.dest(buildDir));
  gulp.src('src/main.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest(buildDir));
});

gulp.task('default', ['sass', 'src']);

