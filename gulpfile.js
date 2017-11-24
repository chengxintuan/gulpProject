const gulp = require('gulp');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const connect = require('gulp-connect');
const uglify = require('gulp-uglify');
const minifycss = require('gulp-minify-css');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const watch = require('gulp-watch');
const path = require('path');

const outputPath = path.join(__dirname, 'build');
const srcPath = path.join(__dirname, 'src');
const jsPath = path.join(srcPath, 'static/js', '*.js');
const cssPath = path.join(srcPath, 'static/css', '*.css');
const templePath = path.join(srcPath, 'page', '*/*.html');

gulp.task('clean', function () {
    return gulp.src(outputPath).pipe(clean());
});

// CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revCss', function () {
    return gulp.src(cssPath)
        .pipe(rev())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: 'last 2 versions'
        }))
        //  .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build/static/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/static/css'));
});

// js生成文件hash编码并生成 rev-manifest.json文件名对照映射
gulp.task('revJs', function () {
    return gulp.src(jsPath)
        .pipe(rev())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        //  .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build/static/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('build/static/js'));
});

// Html替换css、js文件版本
gulp.task('revHtml', function () {
    return gulp.src(['build/**/*.json', templePath])
        .pipe(revCollector(
            // {
            //     replaceReved: true,
            //     dirReplacements: {
            //         'css': '/dist/css',
            //         '/js/': '/dist/js/',
            //         'cdn/': function (manifest_value) {
            //             return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
            //         }
            //     }
            // }
        ))
        .pipe(gulp.dest('build/view'));
});

// 开发构建
gulp.task('dev', function (done) {
    runSequence(
        ['revCss'],
        ['revJs'],
        ['revHtml'],
        done);
});

// 监控文件变化
gulp.task('watch', function () {
    gulp.watch([jsPath, cssPath, templePath], ['dev']);
});

// 静态服务器搭建 (connect任务开启一个web调试服务，访问http://localhost:8080 )
gulp.task('connect', function () {
    connect.server({
        root: path.join(__dirname, 'build'),
        port: 8080,
        livereload: true,
        middleware: function (connect, opt) {
            return [
                // https://github.com/senchalabs/connect/#use-middleware
                function cors(req, res, next) {
                    res.setHeader('Access-Control-Allow-Origin', '*')
                    res.setHeader('Access-Control-Allow-Methods', '*')
                    next();
                }
            ]
        }
    })
});

gulp.task('dist', ['clean', 'dev']);
gulp.task('debug', ['dev', 'connect']);