var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
var users = require('./routes/users');
var manageHomeRoutes = require('./routes/managehome');

var swig = require("swig");

//Nitish dependencies
//var mongoose = require('mongoose');
var expressSession = require('express-session');
var mongooseSession = require('mongoose-session');  
var accountRoutes = require('./routes/account');
var cors=require("cors");
var json = require('jsonfile');
var mailer = require('express-mailer');

var app = express();

//nitish
app.use(cors());
var mongoose = require("./models/mongoose_connector").mongoose;
var db = require("./models/mongoose_connector").db;
console.log("mongoose obj");

mailer.extend(app, {
  from: 'noreplyinstarent@gmail.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'noreplyinstarent@gmail.com',
    pass: 'instarent123'
  }
});

//nitish
var dbName = 'instaRent';
var connectionString = 'mongodb://localhost:60000/' + dbName;

//mongoose.connect(connectionString);

app.use(expressSession({
        key: 'session',
        secret: '128013A7-5B9F-4CC0-BD9E-4480B2D3EFE9',
        store: new mongooseSession(mongoose),
        resave: true,
        saveUninitialized: true,
        cookie: {}
    })
);
console.log("mongoose after session");


// view engine setup
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'swig');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', routes);
app.use('/users', users);
app.use('/managehome', manageHomeRoutes);


//nitish routes
app.use('/api', accountRoutes);

app.get('/signup',function(req,res)
{ 
    console.log("in signup");
res.render('signup.html');
    
});

app.get('/login',function(req,res)
{ 
res.render('login.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
    /*res.render('error', {
      message: err.message,
      error: err
    });*/
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
console.log("mongoose end");

module.exports = app;