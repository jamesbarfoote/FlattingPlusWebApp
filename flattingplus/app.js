var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var port = process.env.PORT || 8080;
var pg = require('pg').native;
var connectionString = "postgres://gmjjkzeggzlbbf:t4oWQipbrMXWYFm0LBu529x1KE@ec2-54-235-104-63.compute-1.amazonaws.com:5432/d9r6u6eji1fjat";
var client = new pg.Client(connectionString);
client.connect();

pg.connect(connectionString, function (err, client, done) {
    if (err) {
        console.error('Could not connect to the database');
        console.error(err);
        return;
    }
    console.log('Connected to database');
    // client.query("SELECT * FROM users;", function (error, result) {
    //     done();
    //     if (error) {
    //     }
    //     //console.log(result);
    // });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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
    res.render('error', {
      message: err.message,
      error: err
    });
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


app.put('/add/user', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var flatGroup = req.body.group;
    var pic = req.body.pic;

    var q = "insert into users (name,email,group,pic) "
        + "values ($1,$2,$3,$4) RETURNING name,email,group, pic";
    var query = client.query(q, [name, email, flatGroup, pic]);
    var results = [];

    //error handler for /add_purchases
    query.on('error', function () {
        res.status(500).send('Error, fail to add to user name:' + name + ' email: ' + email);
    });






module.exports = app;

app.listen(port, function () {
    console.log("Flatting Plus app listening on port: " + port + "!");
});
