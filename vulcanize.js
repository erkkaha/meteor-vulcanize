var vulcan = Npm.require('vulcanize');
var _ = Npm.require('underscore');
var fs = Npm.require('fs');
var path = Npm.require('path');
var rootPath = process.env.VULCANIZE_PATH || 'public';
rootPath = path.resolve(rootPath);

var handler = function(compileStep) {
  var importsHtml = compileStep.read().toString('utf8');

  if (process.env.VULCANIZE) {
    log('Vulcanizing imports...');
    if(process.env.VULCANIZE_PATH){
        if(fs.existsSync('public/components') && rootPath === fs.readlinkSync('public/components')){
            fs.unlinkSync('public/components');
        }
        rootPath = rootPath.replace('/components', '');
    }
    vulcanize(compileStep, importsHtml);
  } else {
    log('Adding all imports...');
    if(process.env.VULCANIZE_PATH){
        if (fs.existsSync('public/components')) {
            if(rootPath !== fs.readlinkSync('public/components')){
                log(rootPath + ' cannot be linked to public directory as public/components already exists');
            }    
        }
        else{
            fs.symlinkSync(rootPath, 'public/components', 'dir');
        }
    }
    addImports(compileStep, importsHtml);
  }

};

var vulcanize = function(compileStep, importsHtml) {

  var vulcanOutputHandler = function(filename, data) {
    compileStep.addAsset({
      path: '/vulcanized.html',
      data: data
    });

    compileStep.addHtml({
      section: 'head',
      data: '<link rel=\'import\' href=\'/vulcanized.html\'>'
    });
  };

  vulcan.setOptions({
    inputSrc: importsHtml,
    outputHandler: vulcanOutputHandler,
    abspath: rootPath,
    strip: true,
    inline: true
  }, function(error) {
    if (error) {
      log(error);
    } else {
      vulcan.processDocument();
    }
  });

};

var addImports = function(compileStep, importsHtml) {
  compileStep.addHtml({
    section: 'head',
    data: importsHtml
  });
};

var log = function() {
  args = _.values(arguments);
  args.unshift("Vulcanize:");
  console.log.apply(this, args);
};

Plugin.registerSourceHandler("imports.html", handler);
