var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user.js').User;
var UserProfileModel = require('../models/user-profile.js');
var uuid = require('node-uuid');
var configAuth = require('./auth');

module.exports = function(passport) {

// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        var sessionUser={
            _id:user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNo: user.phoneNo,
            role: user.role,
            isVerified: user.isVerified,
            address:user.address,
            foreignId: user.foreignId,
            facebook_id: user.facebook_id,
            facebook_token: user.facebook_token,
            google_id: user.google_id,
            google_token: user.facebook_token
            
        }
        
        done(null, sessionUser);
    });

    // used to deserialize the user
    passport.deserializeUser(function(sessionUser, done) {
        User.findById(sessionUser.id, function(err, user) {
            done(err, sessionUser);
        });
    });
    
passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            User.findOne({ 'email' : profile.emails[0].value }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {
                  if(user.google_id=="") 
                      return done(null,null);
                  return done(null, user); // user found, return that user 
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User({

                    // set all of the relevant information
                    google_id: profile.id,
                    google_token: token,
                    facebook_id: "",                  
                    facebook_token: "",                   
                    firstName: profile.displayName,
                    lastName:  "",
                    email:     profile.emails[0].value,
                    phoneNo:"",
                    foreignId:  "",
                    role:"",
                    address: "",
                    isVerified:true,
                    passwordHash:"",
                    passwordSalt: ""
                    });

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });

    }));


passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },
    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'email' : profile.emails[0].value }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    
                    if(user.facebook_id=="") return done(null,null);
                    return done(null, user); // user found, return that user 
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser= new User({
                        
                    facebook_id: profile.id,                   
                    facebook_token: token,                   
                    firstName: profile.name.givenName,
                    lastName:  profile.name.familyName,
                    email:     profile.emails[0].value,
                    phoneNo:"",
                    foreignId:  "",
                    role:"",
                    isVerified:true,
                    address:"",    
                    passwordHash:"",
                    passwordSalt: ""    
                        
                    });
                    
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        // if successful, return the new user
                        return done(null, newUser);
                    });
                }

            });
        });

    }));
                              
                                  
};