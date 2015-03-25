var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'instaRent' });
});

router.get('/managehome', function(req, res, next) {
  res.render('Role Selection.html', { title: 'instaRent' });
});

module.exports = router;
