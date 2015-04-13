// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '1429015320732362', // your App ID
        'clientSecret'  : 'f4d62d8c1c456016636f3610e739cbf0', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback'
    },
    'googleAuth' : {
        'clientID'      : '1095143834431-88grii53dbi7essn06r2iq7dgoero9pa.apps.googleusercontent.com',
        'clientSecret'  : 'ff6TgNsoMSc9jnJPTCx-ksAc',
        'callbackURL'   : 'http://localhost:3000/auth/google/oauth2callback'
    }
};