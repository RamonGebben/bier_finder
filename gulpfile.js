var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var nodemon = require('gulp-nodemon');
var taskListing = require('gulp-task-listing');
var autoprefixer = require('gulp-autoprefixer');

// Add a task to render the output
gulp.task('help', taskListing);

// Compile less
gulp.task('less', function() {
  return gulp.src('./less/index.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

// Prefix
gulp.task('prefix', function () {
    return gulp.src('./public/css/index.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./public/css'));
});

// Start and watch app.js
gulp.task('server', function(){
	nodemon({
		script: 'app.js',
		ext: 'js',
		env: { 'NODE_ENV': 'development' }
	});
});

// Watch die shizzle
gulp.task('watch', function(){
  gulp.watch('./less/*', ['less', 'prefix']);
});

gulp.task('default', ['server', 'less', 'prefix', 'watch']);






