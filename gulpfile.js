var gulp = require('gulp'),
	$ = require('gulp-load-plugins')(),
	spritesmith = require('gulp.spritesmith');
	module.exports = gulp;


/*
 * Default Tasks
 */
// http server
gulp.task('connect', function() {
	$.connect.server({
		root: ['./src'],
		port: 8000,
		livereload: true,
		open:{
			browser:'Google Chrome'
		},
		//middleware: function(connect, options, middlewares) {
		//	middlewares.unshift(function(req, res, next) {
		//		if (req.url !== '/hello/world') return next();
		//		res.end('Hello, world from port #' + options.port + '!');
		//	});
		//	return middlewares;
		//}

	});
});

// Validate HTML
gulp.task('hint', ['reload'], function() {
	gulp.src('./src/**/*.html')
		.pipe($.htmlhint())
		.pipe($.htmlhint.reporter())
		.on('error', $.notify.onError(function(error) {
			return error.message;
		}));
});

// Compile Compass
gulp.task('compass', function(){
	return gulp.src('./scss/*.scss')
				.pipe($.plumber())
				.pipe($.compass({
					//config_file: 'config.rb',
					comments: false,
					css: './src/css/',
					img: './src/images/',
					sass: './scss/'}))
				.on('error', $.notify.onError(function(error) {
					return error.message;
				}));
});

// Shaping CSS
gulp.task('css', ['compass'], function () {
	return gulp.src('./src/{,**/}css/*.css', {read: false})
				.pipe($.shell([
					'perl -p -i -e "s/^  (?! )/\t/g" <%= file.path %>',
					'perl -p -i -e "s/, \./,\n\./g" <%= file.path %>',
					'perl -p -i -e "s/, #/,\n#/g" <%= file.path %>'
				]))
				.pipe($.connect.reload());
});

// Reload server
gulp.task('reload', function(){
	gulp.src('./src')
		.pipe($.connect.reload());
});

// Watch Files
gulp.task('watch',function(){
	gulp.watch(['./scss/*.scss'],['css']);
	gulp.watch(['./src/**/*.html'],['hint']);
	gulp.watch(['./src/**/*.css'],['reload']);
	gulp.watch(['./src/**/*.js'],['reload']);
});


gulp.task('default', function() {
	gulp.run('connect', 'watch');
});



/*
 * Util Tasks
 */
// Criate SpriteImage
gulp.task('sprite', function () {
	var spriteData = gulp.src('./scss/sprite/*.png')
	.pipe(spritesmith({
		imgName: 'sprite.png',
		cssName: '_sprite.scss',
		imgPath: '/images/sprite.png',
		cssFormat: 'scss',
		cssVarMap: function (sprite) {
			sprite.name = 'ico_spr';
		}
	}));
	spriteData.img.pipe(gulp.dest( './src/images/'));
	spriteData.css.pipe(gulp.dest('./scss/core'));
});
