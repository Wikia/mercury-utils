/**
 * Compiles and moves files from src to dist on save
 */

	//This will loop over all folders inside pathToFolder main, secondary
	//Return stream so gulp-folders can concatenate all of them
	//so you still can use safely use gulp multitasking

var gulp = require('gulp'),
	path = require('path'),
	folders = require('gulp-folders'),
	pathToFolder = 'src',
	concat = require('gulp-concat'),
	//ts = require('gulp-typescript'),
	//tsProjects = {},
	//options = {
	//	target: 'es6',
	//	noImplicitAny: true,
	//	removeComments: true,
	//	declarationFiles: false,
	//	sortOutput: true,
	//	suppressImplicitAnyIndexErrors: true
	//},
	babel = require('gulp-babel');

gulp.task('build', folders( pathToFolder, function (folder) {
	return gulp.src(path.join(pathToFolder, folder, '**/*.js'))
		.pipe(babel())
		.pipe(concat(folder + '.js'))
		.pipe(gulp.dest('dist'));
}));

