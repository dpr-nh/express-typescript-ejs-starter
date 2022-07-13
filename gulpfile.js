'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const environments = require('gulp-environments');
const nodemon = require('gulp-nodemon');

const typescript = require('gulp-typescript');
const tsProject = typescript.createProject('./tsconfig.json');

const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

let development = environments.development;
let production = environments.production;

const paths = {
    ts: {
        watch: ['./src/*.ts', './src/**/*.ts'],
        dest: 'dist',
    },
    json: {
        watch: ['./src/*.json', './src/**/*.json'],
        dest: 'dist',
    },
    ejs: {
        watch: ['./views/*.ejs', './views/**/*.ejs'],
    },
    scss: {
        entrypoints: ['./src/assets/styles/core.scss'],
        watch: ['./src/assets/styles/*.scss', './src/assets/styles/**/*.scss'],
        dest: './public/',
    },
};

function ts() {
    const tsResult = tsProject.src()
        .pipe(tsProject());

    return tsResult.js.pipe(gulp.dest(paths.ts.dest));
}

// tsc does this but not gulp-typescript so we have to do it ourselves
function json() {
    return gulp.src(paths.json.watch).pipe(gulp.dest(paths.json.dest));
}

function scss() {
    return gulp.src(paths.scss.entrypoints)
        .pipe(sass.sync({
            outputStyle: production() ? 'compressed' : 'expanded',
            sourceMap: development()
        })
            .on('error', sass.logError))
        .pipe(autoprefixer({
            overrideBrowsersList: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS({
            level: {
                1: {
                    specialComments: 0
                }
            }
        }))
        .pipe(gulp.dest(paths.scss.dest))
        // browserSync.stream() if NODE_ENV=development
        .pipe(development(browserSync.stream()));
}

function watch() {
    gulp.watch(paths.ts.watch, ts);
    gulp.watch(paths.ejs.watch, ts);
    gulp.watch(paths.json.watch, json);
    gulp.watch(paths.scss.watch, scss);

    browserSync.init({
        proxy: 'localhost:8080',
        open: false,
    });

    return nodemon({
        script: './dist/app.js',
        nodeArgs: [
            '-r',
            'dotenv/config',
        ],
        
    }).on('start', function() {
        browserSync.reload();
    });
}

exports.ts = ts;
exports.scss = scss;
exports.json = json;
exports.watch = watch;

gulp.task('default', watch);
gulp.task('build', gulp.parallel(ts, scss, json));
