var os = require('os');
var fs = require('fs');
var crypto = require('crypto');
var util = require('util');
var path = require('path');
var childProcess = require('child_process');

var PLANTUML_JAR = path.join(__dirname, 'vendor/plantuml.jar');

function hashedImageName(content) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(content);

  return md5sum.digest('hex')
}

module.exports = {
  blocks: {
    plantuml: {
      process: function (block) {

        var imageName = hashedImageName(block.body) + ".png";
        this.log.debug("using tempDir ", os.tmpdir());
        var imagePath = path.join(os.tmpdir(), imageName);
        var umlText = block.body;

        if (fs.existsSync(imagePath)) {
          this.log.info("skipping plantUML image for ", imageName);
        }
        else {
          this.log.info("rendering plantUML image to ", imageName);

          var cwd = cwd || process.cwd();

          childProcess.spawnSync("java", [
              '-Dplantuml.include.path=' + cwd,
              '-Djava.awt.headless=true',
              '-jar', PLANTUML_JAR,
              '-pipe'
            ],
            {
              // TODO: Extract stdout to a var and persist with this.output.writeFile
              stdio: ['pipe', fs.openSync(imagePath, 'w'), 'pipe'],
              input: umlText
            });
        }
        
        this.log.debug("copying plantUML from tempDir for ", imageName);
        this.output.copyFile(imagePath,imageName);

        return "<img src=\"" + path.join("/", imageName) + "\"/>";
      }
    }
  }
};
