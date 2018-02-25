const gulp = require('gulp');

const watch = require('gulp-watch');
const jasmineNode = require('gulp-JASMINE');
const fork = require('child_process').fork;


gulp.task('tests', function () {
  let ls = null;
  let runTests = () => {
    process.env.BOTBUILDERUNIT_USE_INSTRUMENTED_SOURCE = './src';
    if (ls) {
      ls.kill();
      ls = null;
    }
    let command = `${process.env['PWD']}/testRunner.js`;
    let options = {
      cwd: process.env.PWD + '/',
      env: process.env,
      silent: false
    };
    ls = fork(command, options);
  }
  runTests();
  //Callback mode, useful if any plugin in the pipeline depends on the `end`/`flush` event
  return watch(['src/**/*.js', 'spec/**/*.js', 'botbuilder-composer.js', 'config/**/*.json'], function () {
    runTests();
  });
});

