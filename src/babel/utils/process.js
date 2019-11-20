// Fork of https://github.com/callstack/linaria
// which is MIT (c) callstack
exports.nextTick = fn => setTimeout(fn, 0);

exports.platform = exports.arch = exports.execPath = exports.title = 'browser';
exports.pid = 1;
exports.browser = true;
exports.argv = [];

exports.binding = function binding() {
  throw new Error('No such module. (Possibly not yet loaded)');
};

exports.cwd = () => '/';

exports.exit = exports.kill = exports.chdir = exports.umask = exports.dlopen = exports.uptime = exports.memoryUsage = exports.uvCounters = () => {};
exports.features = {};

exports.env = {
  NODE_ENV: process.env.NODE_ENV,
};
