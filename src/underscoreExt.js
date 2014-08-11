(function() {
  var _;
  _ = require("underscore");
  _.mixin({
    mapObjVals: function(obj, f) {
      return _.foldl(obj, function(acc, value, key, list) {
        acc[key] = f(value, key, list);
        return acc;
      }, {});
    },
    randomNum: function(min, max) {
      return Math.random() * (max - min) + min;
    },
    randomInt: function(min, max) {
      return Math.floor(_.randomNum(min, max));
    },
    randomFrom: function(list) {
      return list[_.randomInt(0, list.length)];
    },
    takeCyclic: function(list, n) {
      var taken;
      if (_.isEmpty(list)) {
        return [];
      }
      taken = _.take(list, n);
      if (taken.length < n) {
        return taken.concat(_.takeCyclic(list, n - taken.length));
      } else {
        return taken;
      }
    }
  });
  module.exports = _;
}).call(this);
