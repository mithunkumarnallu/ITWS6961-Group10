var FacebookStrategy = require('passport-facebook').Strategy;
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
            foreignId: user.foreignId,
            facebook_id: user.facebook_id,
            facebook_token: user.facebook_token
            
        }
        
        done(null, sessionUser);
    });

    // used to deserialize the user
    passport.deserializeUser(function(sessionUser, done) {
        User.findById(sessionUser.id, function(err, user) {
            done(err, sessionUser);
        });
    });

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
            User.findOne({ 'facebook_id' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    var userProfile = new UserProfileModel({
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
						phoneNo: user.phoneNo,
						role: user.role,
                        isVerified: user.isVerified,
						foreignId: user.foreignId,
                        facebook_id: user.facebook_id,
                        facebook_token: user.facebook_token
                    });

                   /* req.session.userProfileModel = userProfile;
					req.session.id = me.uuid.v4();
                    return done(null, user); // user found, return that user */
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
                    passwordHash:"",
                    passwordSalt: ""    
                        
                    });
                    var userProfile = new UserProfileModel({
                        email: newUser.email,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
						phoneNo: newUser.phoneNo,
						role: newUser.role,
                        isVerified: newUser.isVerified,
						foreignId: newUser.foreignId,
                        facebook_id: newUser.facebook_id,
                        facebook_token: newUser.facebook_token
                    });

                   /* req.session.userProfileModel = userProfile;
					req.session.id = me.uuid.v4() ;*/
                    
                    

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