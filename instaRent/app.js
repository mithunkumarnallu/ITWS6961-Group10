var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//var routes = require('./routes/index');
var users = require('./routes/users');
var manageHomeRoutes = require('./routes/managehome');
var tenantPayments = require('./routes/payments');

var swig = require("swig");

//Nitish dependencies
//var mongoose = require('mongoose');
var expressSession = require('express-session');
var mongooseSession = require('mongoose-session');  
var accountRoutes = require('./routes/account');
var passport = require('passport');
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
require('./config/passport')(passport);
app.use(expressSession({
        key: 'session',
        secret: '128013A7-5B9F-4CC0-BD9E-4480B2D3EFE9',
        store: new mongooseSession(mongoose),
        resave: true,
        saveUninitialized: true,
        cookie: {}
    })
);
app.use(passport.initialize());
app.use(passport.session());


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
app.use('/payments', tenantPayments);


//nitish routes
app.use('/api', accountRoutes);
require('./routes/social.js')(app, passport); 

app.get('/signup',function(req,res)
{ 
    console.log("in signup");
res.render('signup.html');
    
});

app.get('/login',function(req,res)
{ 
res.render('login.html');
});


// Amy routes
getUserDetails = function() {
  //return userHelper.getUserDetails();
  return {email:"amyzhaosicong@gmail.com", firstName:"Amy", lastName:"Zhao", phoneNumber:"5182698510"};

};
app.get('/settings', function(req, res) {
  console.log("in settings");
  res.render('settings.html', getUserDetails());
});
app.get('/settings_password', function(req, res) {
  console.log("in settings_password");
  res.render('settings_password.html');
});




//Luying routes
//Luying routes
getTenantDetails = function() {
  //return userHelper.getTenantDetails
  return {
    userName: "Peter",
    activeComplaints: "2",
    rentDue: "900",
    rentDueIn: "30",
    landlord: {
      name: "Plotka",
      email: "Plotka4@rpi.edu",
      phone: "518269810"
    },
    userRole: "Tenant"
  };
}

getLandlordDetails = function() {
  //return userHelper.getLandlordDetails
  return {
    userName: "Plotka",
    activeComplaints: "3",
    rentDue: "1800",
    rentDueIn: "30",
    rents:[{
      name: "Peter",
      email: "peter4@rpi.edu",
      phone: "5186056957"
    },
    {
      name: "Roger",
      email: "Roger4@rpi.edu",
      phone: "5189087863"
    }],
    userRole: "Landlord",
    rentStatus: [{
      name: "Peter",
      rentPaidOn: "10",
    },{
      name: "Roger",
      rentPaidOn: "14",
    }],
    rentToBePaid: "2"
  };
}
app.get('/dashboard', function(req,res)
{
  console.log("success");
  res.render('dashboard.html',getTenantDetails());

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
module.exports = app;