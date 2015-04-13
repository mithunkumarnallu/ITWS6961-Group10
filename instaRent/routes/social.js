module.exports = function(app, passport) {
    
    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/managehome',
            failureRedirect : '/login_error',
            
        }));
    
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/oauth2callback',
            passport.authenticate('google', {
                    successRedirect : '/managehome',
                    failureRedirect : '/login_error'
            }));

}

    