import * as colors from 'colors';
import * as moment from 'moment';
import GulpClient = require('gulp');
import { watch } from 'gulp';
import del = require('del');
import { config } from './config';

const log = (text: string) => {
  console.log('[' + colors.white(moment().format('HH:mm:ss') + '] ' + text));
};

const fileWatcher = (globs: GulpClient.Globs, callback: () => void, extname: string = '') => {
  const watcher = watch(globs);

  watcher.on('change', (path: string, status) => {
    callback();
  });
  watcher.on('add', (path: string) => {
    callback();
  });
  watcher.on('unlink', (path: string) => {
    if (extname) {
      path = path.replace(/\\/g, '/').replace(config.src, config.outputPath);
      path = path.substring(0, path.lastIndexOf('.')) + extname;
      console.log(path);
    }
    del.sync(path);
  });
};

export { log, fileWatcher };
