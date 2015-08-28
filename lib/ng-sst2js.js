var util = require('util'),
  path = require('path'),
  fs = require('fs'),
  cheerio = require('cheerio');

// TODO configurable
var encoding = {encoding: 'utf8'},
  TPL = fs.readFileSync(path.join(__dirname, '/template.txt'), encoding),
  SINGLE_MODULE_TPL = fs.readFileSync(path.join(__dirname,
    '/single-module-template.txt'), encoding);

var escapeContent = function escapeContent(content) {
  return content.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r?\n/g,
    '\\n\' +\n    \'');
};

var parseTemplates = function parseTemplates(content, htmlPath, moduleName) {
  var $ = cheerio.load(content),
    puts = [],
    output,
    selector = 'script[type="text/ng-template"]',
    addTemplate = function addTemplate() {
      var id = $(this).attr('id'),
        content = escapeContent($(this).html());
      puts.push(util.format('  $templateCache.put(\'%s\',\n    \'%s\');', id,
        content));
    };
  $(selector).each(addTemplate);
  $.root().filter(selector).each(addTemplate);
  puts = puts.join('\n\n');
  if (moduleName) {
    output =
      util.format(SINGLE_MODULE_TPL, moduleName, moduleName, puts);
  }
  else {
    output = util.format(TPL, htmlPath, puts);
  }
  return output;
};

var createNgSst2JsPreprocessor = function createNgSst2JsPreprocessor(logger,
  basePath, config) {
  var log = logger.create('preprocessor.ng-sst2js'),
    moduleName;
  config = typeof config === 'object' && config !== null ? config : {};
  moduleName = config.moduleName;

  return function (content, file, done) {
    var htmlPath;

    log.debug('Processing "%s".', file.originalPath);

    htmlPath = file.originalPath.replace(path.join(basePath + path.sep,
      ''));

    file.path = file.path + '.js';

    done(parseTemplates(content, htmlPath, moduleName));
  };
};

createNgSst2JsPreprocessor.$inject =
  ['logger', 'config.basePath', 'config.ngSst2JsPreprocessor'];

module.exports = createNgSst2JsPreprocessor;
