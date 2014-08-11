(function() {
  var MAX_ARRAY_LENGTH, MAX_NUMBER, MIN_NUMBER, async, clean, data, env, gen, jsv, metaSchema, nonEmpty, uuid, validate, _;
  _ = require("./underscoreExt");
  async = require("async");
  jsv = require("JSV").JSV;
  uuid = require("node-uuid");
  data = require("./data");
  MAX_NUMBER = 100;
  MIN_NUMBER = -100;
  MAX_ARRAY_LENGTH = 5;
  nonEmpty = function(strs) {
    return _.filter(strs, function(s) {
      return s && s.trim() !== "";
    });
  };
  clean = function(s) {
    return s != null ? s.trim() : void 0;
  };
  gen = {
    paragraphs: function(n, done) {
      return data.paragraphs(function(err, paras) {
        return done(err, _.takeCyclic(nonEmpty(paras), n).join("\n"));
      });
    },
    sentence: function(done) {
      return gen.paragraphs(1, function(err, para) {
        var sentences;
        sentences = nonEmpty(para.match(/[^\.!\?]+[\.!\?]+/g));
        if (_.isEmpty(sentences)) {
          return gen.sentence(done);
        } else {
          return done(err, clean(_.randomFrom(sentences)));
        }
      });
    },
    word: function(done) {
      return gen.sentence(function(err, sentence) {
        var word, words;
        words = sentence.split(" ");
        word = _.randomFrom(nonEmpty(words));
        word = word.toLowerCase().replace(/[^a-z\-]/g, "");
        if (word === "") {
          return gen.word(done);
        } else {
          return done(err, clean(word));
        }
      });
    },
    name: function(done) {
      return data.names(function(err, names) {
        return done(err, clean(_.randomFrom(names)));
      });
    },
    title: function(done) {
      return data.titles(function(err, titles) {
        return done(err, clean(_.randomFrom(titles)));
      });
    },
    id: function(done) {
      return done(null, uuid.v4());
    },
    image: function(size, done) {
      return done(null, 'http://hhhhold.com/' + size + "?" + _.randomInt(0, 16777215));
    },
    
    ipsumString: function(schema, done) {
      var genFun;
      genFun = (function() {
        switch (schema.ipsum) {
          case "id":
            return gen.id;
          case "name":
            return gen.name;
          case "first name":
            return function(done) {
              return gen.name(function(err, name) {
                return done(err, name.split(' ')[0]);
              });
            };
          case "last name":
            return function(done) {
              return gen.name(function(err, name) {
                return done(err, name.split(' ').slice(1).join(' '));
              });
            };
          case "title":
            return gen.title;
          case "word":
            return gen.word;
          case "sentence":
            return gen.sentence;
          case "paragraph":
            return function(done) {
              return gen.paragraphs(1, done);
            };
          case "long":
            return function(done) {
              return gen.paragraphs(_.randomInt(1, 10), done);
            };
          case "small image":
            return function(done) {
              return gen.image('s', done);
            };
          case "medium image":
            return function(done) {
              return gen.image('m', done);
            };
          case "large image":
            return function(done) {
              return gen.image('l', done);
            };
          default:
            return gen.sentence;
        }
      })();
      return genFun(done);
    },
    formattedString: function(schema, done) {
      var ret, suffix;
      ret = function(s) {
        return done(null, s);
      };
      suffix = function() {
        return _.randomFrom(["com", "org", "net", "edu", "xxx"]);
      };
      switch (schema.format) {
        case "date-time":
          return ret((new Date(_.randomInt(0, Date.now()))).toISOString());
        case "color":
          return ret("#" + _.randomInt(0, 16777215).toString(16));
        case "phone":
          return ret("(" + (_.randomInt(0, 999)) + ") " + (_.randomInt(0, 999)) + " " + (_.randomInt(0, 9999)));
        case "uri":
          return gen.word(function(err1, word1) {
            return gen.word(function(err2, word2) {
              return done(err1 || err2, "http://" + word1 + "." + word2 + "." + (suffix()));
            });
          });
        case "email":
          return gen.name(function(err, name) {
            return gen.word(function(err2, word) {
              name = name.toLowerCase().replace(/\s/g, "_");
              return done(err || err2, "" + name + "@" + word + "." + (suffix()));
            });
          });
        default:
          return ret("String format " + schema.format + " not supported");
      }
    },
    string_old: function(schema, done) {
      if (schema.format != null) {
        return gen.formattedString(schema, function(err, s) {
          return done(err, clean(s));
        });
      } else {
        return gen.ipsumString(schema, function(err, s) {
          return done(err, clean(s));
        });
      }
    },
    
    string: function(schema, done){
    	return done(null,"");
    },
    
    number: function(schema, rand, done) {
      return done(null, 0);
    },
    byEnum: function(schema, done) {
      if (!_.isArray(schema["enum"])) {
        done("Value for \"enum\" must be an array.");
      }
      if (_.isEmpty(schema["enum"])) {
        return done("Array for \"enum\" must not be empty.");
      } else {
        return done(null, _.randomFrom(schema["enum"]));
      }
    },
    byType: function(schema, done) {
      var _i, _ref, _results;
      switch (schema.type) {
        case "boolean":
          return done(null, false);
        case "number":
          return gen.number(schema, _.randomNum, done);
        case "integer":
          return gen.number(schema, _.randomInt, done);
        case "string":
          return gen.string(schema, done);
        case "object":
          return async.map(_.values(schema.properties), gen.ipsum, function(err, ipsumVals) {
            return done(err, _.object(_.keys(schema.properties), ipsumVals));
          });
        case "array":
          if (schema.items != null) {
            return async.map((function() {
              _results = [];
              for (var _i = 0, _ref = _.randomInt(0, MAX_ARRAY_LENGTH); 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
              return _results;
            }).apply(this, arguments), function(i, done) {
              return gen.ipsum(schema.items, done);
            }, done);
          } else {
            return done("Missing \"items\" schema for schema of type \"array\"");
          }
          break;
        case "any":
          return done("Type \"any\" not supported.");
        default:
          return done("Bad type: \"" + schema.type + "\"");
      }
    },
    ipsum: function(schema, done) {
      if (schema["enum"] != null) {
        return gen.byEnum(schema, done);
      } else {
        return gen.byType(schema, done);
      }
    },
    ipsums: function(schema, n, done) {
      var _i, _ref, _results;
      return async.map((function() {
        _results = [];
        for (var _i = 0, _ref = n - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this, arguments), function(i, done) {
        return gen.ipsum(schema, done);
      }, done);
    }
  };
  env = jsv.createEnvironment("json-schema-draft-03");
  metaSchema = env.findSchema("http://json-schema.org/draft-03/schema");
  validate = function(schema) {
    var report;
    report = env.validate(schema, metaSchema);
    if (_.isEmpty(report.errors)) {
      return null;
    } else {
      return report.errors;
    }
  };
  module.exports = {
    validate: validate,
    genIpsums: gen.ipsums
  };
}).call(this);
