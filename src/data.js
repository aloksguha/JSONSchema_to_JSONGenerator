(function() {
  var filesInDir, fs, nameFiles, paraFiles, readFile, titleFiles, _;
  fs = require("fs");
  _ = require("./underscoreExt");
  filesInDir = function(dir) {
    return _.map(fs.readdirSync(dir), function(f) {
      return dir + "/" + f;
    });
  };
  paraFiles = filesInDir("data/paras");
  nameFiles = filesInDir("data/names");
  titleFiles = filesInDir("data/titles");
  readFile = function(files, done) {
    return fs.readFile(_.randomFrom(files), "utf8", function(err, contents) {
      return done(err, contents.split("\n"));
    });
  };
  module.exports = {
    paragraphs: function(done) {
      return readFile(paraFiles, done);
    },
    names: function(done) {
      return readFile(nameFiles, done);
    },
    titles: function(done) {
      return readFile(titleFiles, done);
    }
  };
}).call(this);
