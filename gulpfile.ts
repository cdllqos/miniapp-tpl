import { series, src, dest, parallel } from 'gulp';
import * as ts from 'gulp-typescript';
import * as del from 'del';
import * as colors from 'colors';
import { config } from './utils/config';
import { log, fileWatcher } from './utils/utils';
import sass = require('gulp-sass');
import rename = require('gulp-rename');

const tsProject = ts.createProject('tsconfig.json', { noImplicitAny: true });

const fileTypes = {
  ts: `${config.src}**/*.ts`,
  wxml: `${config.src}**/*.wxml`,
  json: `${config.src}**/*.json`,
  scss: `${config.src}**/*.scss`
};

const cleanTask = (fnc: () => void) => {
  log(colors.white(`清理${config.outputPath}文件路径`));
  del.sync(config.outputPath);
  log(colors.green(`清理成功!`));
  fnc();
};

const copy = () => {
  return dest(config.outputPath);
};

const complieHandler = (
  stream: NodeJS.ReadWriteStream,
  type: string,
  msgHandler: (error: any) => any = error => error
) => {
  let complieFlag = true;
  stream
    .on('error', error => {
      complieFlag = false;
      log(colors.red(msgHandler(error)));
    })
    .on('finish', () => {
      if (!complieFlag) {
        complieFlag = true;
        return;
      }
      log(colors.green(`${type}编译成功`));
    });
};

const tsComplieTask = () => {
  const project = tsProject();
  complieHandler(project, 'ts');
  return src(fileTypes.ts)
    .pipe(project)
    .js.pipe(copy());
};

const scssComplieTask = () => {
  const sassProject = sass();
  complieHandler(sassProject, 'sass', error => error.formatted);
  return src(fileTypes.scss)
    .pipe(sassProject)
    .pipe(
      rename({
        extname: '.wxss'
      })
    )
    .pipe(copy());
};

const copyTasks = () => {
  return src([fileTypes.wxml, fileTypes.json])
    .pipe(copy())
    .on('finish', () => {
      log(colors.green('文件更改成功'));
    });
};

const watchTask = () => {
  fileWatcher(fileTypes.ts, tsComplieTask, '.js');
  fileWatcher([fileTypes.wxml, fileTypes.json], copyTasks);
  fileWatcher(fileTypes.scss, scssComplieTask, '.wxss');
};

const run = () => {
  return series(cleanTask, parallel(scssComplieTask, tsComplieTask, copyTasks), watchTask);
};

exports.default = run();
