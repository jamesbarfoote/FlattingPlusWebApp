var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

var port = process.env.PORT || 8080;

app.use("/", express.static(__dirname + '/public'));//serve up the website

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
// app.set('views', path.join(__dirname, 'views'));
// app.use("/", express.static(__dirname + '/public'));//serve up the website

// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
/app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

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
});

//get user
app.put('/get/user', function (req, res) {
    var userEmail = req.body.email;
    var userPass = req.body.pass;
    //console.log(userEmail);
    var q = "SELECT * FROM users WHERE email=$1";
    var query = client.query(q, [userEmail]);

    var results = [];

    //error handler for /get_users
    query.on('error', function () {
        res.status(500).send('Error, fail to get users: ' + userEmail);
    });

    //stream results back one row at a time
    query.on('row', function (row) {
        console.log('Pass = ' + row.pass + ' email: ' + row.email);
        results.push(row);
    });

    //After all data is returned, close connection and return results
    query.on('end', function () {
        res.json(results);
        console.log("result: " + results);
    });
});

//update user
app.post('/update/user', function (req, res) {
    var userName = req.body.name;
    var userEmail = req.body.email;
    var userGroup = req.body.group;
    var userPic = req.body.pic;

    var q = "update user set name = $1, flatgroup = $2, pic = $3 where email = $4";
    var query = client.query(q, [userName, userGroup, userPic, userEmail]);
    var results = [];

    //error handler for /update_cart
    query.on('error', function () {
        res.status(500).send('Error, fail to update user:' + name + ' email: ' + email);
    });

    //stream results back one row at a time
    query.on('row', function (row) {
        results.push(row);
    });

    //after all the data is returned close connection and return result
    query.on('end', function () {
        res.json(results);
        console.log("result: " + results);
    });
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


module.exports = app;

app.listen(port, function () {
    console.log("Flatting Plus app listening on port: " + port + "!");
});