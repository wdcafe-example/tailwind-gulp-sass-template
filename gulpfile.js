// Plug Loads
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const cssMin = require('gulp-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const { exec } = require('child_process');
const { src, dest, series, parallel, watch } = require('gulp');


// Task Settings
// Tailwind CSS watch task
function tailwindWatch(done) {
  exec('npx tailwindcss -i ./src/tailwind.css -o ./dist/css/main.css --watch', (err, stdout, stderr) => {
    if (err) {
      console.error(`Error: ${stderr}`);
      done(err);
    } else {
      console.log(stdout);
      done();
    }
  });
}

// scss task
function scssTask(){
  return gulp.src('./scss/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest('./dist/css/'))   // main.css 로 번들링 됨!
    .pipe(browserSync.stream());
}

// CSS Task - CSS 파일 병합 및 압축작업
function cssTask(){
  return src('./dist/css/*.css')
  .pipe(concat('main.css'))
  .pipe(cssMin())
  .pipe(gulp.dest('./publish/css'));
}


// JS Task - JS 파일 병합 및 압축작업 
function jsTask(){
  return src([
    './node_modules/jquery/dist/jquery.min.js',
    './dist/js/main.js' 
  ])
  .pipe(concat('main.js'))
  .pipe(uglify())
  .pipe(gulp.dest('./publish/js'));
}

// Clean Task - dist 폴더 삭제 작업
function cleanDist() {
  return src('publish', { allowEmpty: true })
    .pipe(clean());
}
 

// Copy Task - 파일 복사 작업
// function copyIndex(){
//   return src('./*.html').pipe(gulp.dest('dist/'));
// }

function copyHtml(){
  return src('./dist/*').pipe(gulp.dest('./publish/'));
}

// function copyImage(){
//   return src('./images/**/*').pipe(gulp.dest('dist/images'));
// }

  
// watch task
function watchTask(){
  // server settings
  browserSync.init({
    server: {
      baseDir: './dist/'
    },
    port: 3000,
    notify: false, // 브라우저 알림 비활성화
  });

  // task watch
  gulp.watch('./scss/*.scss', scssTask); // scss 폴더의 SCSS 파일 변경 시 scssTask 실행
  gulp.watch('./dist/js/*.js', jsTask); // js 폴더의 JS 파일 변경 시 jsTask 실행
  gulp.watch('./dist/*.html').on('change', browserSync.reload);
  gulp.watch('./dist/js/*.js').on('change', browserSync.reload);
  gulp.watch('./dist/css/*.css').on('change', browserSync.reload);
}
 

// Export Settings
exports.tailwindWatch = tailwindWatch;
exports.scssTask = scssTask;
exports.cssTask = cssTask;
exports.jsTask = jsTask;
exports.copyHtml = copyHtml;
exports.watchTask = watchTask;
exports.cleanDist = cleanDist;
// exports.copyImage = copyImage;


// 처리할 Task(작업)이 많을 경우
// exports.default = series(cleanDist, parallel(scssTask, jsTask, cssTask, copyIndex, copyHtml, copyJS, copyImage), watchTask);
exports.default = series(cleanDist, parallel(scssTask, jsTask, cssTask, copyHtml), parallel(tailwindWatch, watchTask));
