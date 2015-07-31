/**
 * Compiles and moves files from src to dist on save
 */

var gulp = require('gulp'),
	folders = require('gulp-folders'),
	ts = require('gulp-typescript'),
	tsProjects = {},
	options = {
		target: 'es6',
		noImplicitAny: true,
		removeComments: true,
		declarationFiles: false,
		sortOutput: true,
		suppressImplicitAnyIndexErrors: true
	};

gulp.task('build', folders( 'src', function (folder) {
	if (!tsProjects[folder]) {
		tsProjects[folder] = ts.createProject(options);
	}

	return gulp.src([
		'src/**/*.ts'
	])
		.pipe(ts(tsProjects[folder])).js
		.pipe(gulp.dest('dist'));
}));

