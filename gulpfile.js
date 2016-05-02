const gulp = require('gulp');
const babel = require('gulp-babel');
const webpack = require('webpack-stream');

const buildDir = 'build';

gulp.task('default', () => {
  gulp.src('manifest.json')
    .pipe(gulp.dest(buildDir));
  gulp.src('src/main.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(gulp.dest(buildDir));
});
