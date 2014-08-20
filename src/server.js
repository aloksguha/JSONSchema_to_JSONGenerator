(function() {
  var MAX_ITEMS, PUBDIR, app, async, cors, express, expressWinston, http, schema, winston, _;
  express = require("express");
  http = require("http");
  _ = require("./underscoreExt");
  winston = require("winston");
  expressWinston = require("express-winston");
  async = require("async");
  cors = require("connect-xcors");
  schema = require("./schema");
  app = express();
  console.log(process.env.NODE_ENV);
  PUBDIR = __dirname + (process.env.NODE_ENV === "development" ? "/../front/public" : "/../public");
  console.log(PUBDIR);
  MAX_ITEMS = 50;
  app.set("name", "Schematic Ipsum");
  app.set("port", process.env.PORT || 3000);
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cors());
  app.use(express.static(PUBDIR));
  app.use(app.router);
  app.use(express.errorHandler());
  app.post("/", function(req, res) {
    return async.waterfall([
      function(done) {
        if ((!(req.body != null)) || (_.isEmpty(req.body))) {
          return done("Request missing body, which should be JSON schema.");
        } else {
          return done(null);
        }
      }, function(done) {
        var _base, _ref;
                if ((_ref = (_base = req.query).n) != null) {
          _ref;
        } else {
          _base.n = 1;
        };
        req.query.n = parseInt(req.query.n);
        if (!_.isNumber(req.query.n)) {
          return done("Query param \"n\" must be a number, you sent " + req.query.n);
        } else if (!(req.query.n > 0 && req.query.n <= MAX_ITEMS)) {
          return done("Query param \"n\" must be between 0 and " + MAX_ITEMS);
        } else {
          return done(null);
        }
      }, function(done) {
        return done(schema.validate(req.body));
      }, function(done) {
        console.log("---------------------JSON Schema-------------------------");
        console.log(req.body);
        return schema.genIpsums(req.body, req.query.n, done);
      }//,
//      function(jsonObj,done){
//          console.log("+++++++++++");
//          console.log(jsonObj);
//          console.log("++++++++++");
//    	  return someExtraWays(jsonObj,done);
//      }
//
   ]
        , function(err, ipsums) {
      var response;
      if (err != null) {
        console.error(err);
        return res.send(400, err);
      } else {

        response = ipsums.length === 1 ? ipsums[0] : ipsums;
          console.log("---------------------Generated JSON---------------------------");
          console.log(JSON.stringify(response));
        return res.send(200, JSON.stringify(response, {}, "  "));
      }
    });
  });
  
  function someExtraWays(json, done){
      console.log("coming here");
      var resp = json.length === 1 ? json[0] : json;

	  return done(resp);
 	  //console.log(json[0].name);
	  
	  
  }
  
  http.createServer(app).listen(app.get("port"), function() {
    return console.log("" + (app.get("name")) + " listening on port " + (app.get("port")));
  });
}).call(this);
