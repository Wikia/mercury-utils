/**
 * Compiles and moves files from src to dist on save
 */

var gulp = require('gulp'),
	path = require('path'),
	folders = require('gulp-folders'),
	concat = require('gulp-concat'),
	ts = require('gulp-typescript'),
	newer = require('gulp-newer'),
	pathToFolder = 'src',
	tsProjects = {},
	options = {
		target: 'es6',
		noImplicitAny: true,
		removeComments: true,
		declarationFiles: false,
		sortOutput: true,
		suppressImplicitAnyIndexErrors: true
	};

gulp.task('build', folders( pathToFolder, function (folder) {
	return gulp.src([
		'!' + path.join(pathToFolder, folder, '**/*.d.ts'),
		path.join(pathToFolder, folder, '**/*.ts')
	])
//		.pipe(newer(path.join('dist', folder + '.js')))
		.pipe(ts(tsProjects[folder])).js
		.pipe(concat(folder + '.js'))
		.pipe(gulp.dest('dist'));
}));

