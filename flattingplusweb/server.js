var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var FCM = require('fcm-push');
var serverKey = 'AIzaSyBi-6JXpT40KLFn4e6k0wLa9kdDFAbvnU0';
var fcm = new FCM(serverKey);
var request = require("request");

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
});

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.put('/add/user', function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var flatGroup = req.body.group;
  var pic = req.body.pic;

  console.log("name: " + name + " email: " + email);
  var q = "insert into users (email,name, pic, flatgroup) values ($1,$2, $3, $4) RETURNING email, name, flatgroup";
  var query = client.query(q, [email, name, pic, flatGroup]);
  var results = [];

  //error handler for /add user
  query.on('error', function () {
    res.status(500).send('Error, fail to add user ' + name);
  });

  //stream results back one row at a time
  query.on('row', function (row) {
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end', function () {
    // var ob = JSON.stringify(results);
    var obj = { email: results[0].email, name: results[0].name, flatgroup: results[0].flatgroup };
    res.json(obj);
    console.log("result: " + obj);
  });
});

//get user
app.get('/get/user', function (req, res) {
  var userEmail = req.query.email;
  var userPass = req.body.pass;
  console.log("get user, email: " + userEmail);
  var q = "SELECT * FROM users WHERE email=$1";
  var query = client.query(q, [userEmail]);

  var results = [];

  //error handler for /get_users
  query.on('error', function () {
    res.status(500).send('Error, fail to get users: ' + userEmail);
  });

  //stream results back one row at a time
  query.on('row', function (row) {
    console.log('Row ' + row);
    results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end', function () {
    res.json(results);
    console.log("result: " + results[0]);
  });
});

//update user
app.post('/update/user', function (req, res) {
  var userName = req.body.name;
  var userEmail = req.body.email;
  var userGroup = req.body.group;
  var userPic = req.body.pic;
  console.log(userName + " " + userEmail + " " + userGroup + " " + userPic);
  var q = "UPDATE users SET name=($1), flatgroup=($2), pic=($3) where email=($4)";
  var query = client.query(q, [userName, userGroup, userPic, userEmail]);
  var results = [];

  //error handler for /update_cart
  query.on('error', function () {
    res.status(500).send('Error, fail to update user:' + userName + ' email: ' + userEmail);
  });

  //stream results back one row at a time
  query.on('row', function (row) {
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end', function () {
    var obj = {};

    // var obj = { groupname: results[0].groupname, email: results[0].email, name: results[0].name };
    res.json(obj);
    console.log("result: " + obj);
  });
});

app.get('/get/users', function (req, res) {
  var userName = req.body.name;

  var query = client.query("select * from users");
  var results = [];

  //error handler for /get_users
  query.on('error', function () {
    res.status(500).send('Error, fail to get users: ' + userName);
  });

  //stream results back one row at a time
  query.on('row', function (row) {
    results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end', function () {
    res.json(results);
    console.log("result: " + results);
  });
});


//get group
app.get('/get/flatgroup', function (req, res) {
  var groupName = req.query.gname;
  var groupPass = req.query.pass;
  console.log("get group, name: " + groupName + " password: " + groupPass);
  var q = "SELECT * FROM flatgroup WHERE groupname=$1 and password=$2";
  var query = client.query(q, [groupName, groupPass]);

  var results = [];

  //error handler for /get_users
  query.on('error', function () {
    res.status(500).send('Error, fail to get group: ' + userEmail);
  });

  //stream results back one row at a time
  query.on('row', function (row) {
    results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end', function () {
    res.json(results);
    console.log("result: " + results[0]);
  });
});

app.put('/add/group', function (req, res) {
  var flatGroup = req.body.group;
  var pass = req.body.gpass;
  console.log("Group: " + flatGroup + " Pass: " + pass);

  var q = "insert into flatgroup (groupname,password) values ($1, $2) RETURNING groupname, password, notes, shoppinglist, calendar, money";
  // var q = "insert into flatgroup (groupname,password) "
  //     + "values ($1,$2) RETURNING id, groupname,password, notes, shoppinglist, calendar, money";
  var query = client.query(q, [flatGroup, pass]);
  var results = [];

  //error handler for /add group
  query.on('error', function () {
    res.status(500).send('Error, fail to add to user name:' + name + ' email: ' + email);
  });
  //stream results back one row at a time
  query.on('row', function (row) {
    results.push(row);
  });

  //After all data is returned, close connection and return results
  query.on('end', function () {
    var obj = { groupname: results[0].groupname, password: results[0].password, notes: results[0].notes };

    res.json(obj);
    console.log("result: " + obj);
  });
});



// app.put('/add/note', function (req, res) {
//     var flatGroup = req.body.group;
//     var title = req.body.notetitle;
//     var content = req.body.notecontent;
//     var owner = req.body.notecreator;
//     var time = req.body.notetimestamp;
//     console.log(title + ' groupname: ' + flatGroup + ' content: ' + content + ' owner: ' + owner + ' time: ' + time);
//
//     var q = "insert into notes (groupname,content, title, creator, currtime) values ($1, $2, $3, $4, $5) RETURNING groupname, title, content, creator";
//     var query = client.query(q, [flatGroup, content, title, owner, time]);
//     var results = [];
//
//     //error handler for /add group
//     query.on('error', function () {
//         res.status(500).send('Error, fail to add to notes:' + title + ' groupname: ' + flatGroup + ' content: ' + content + ' owner: ' + owner + ' time: ' + time);
//     });
//     //stream results back one row at a time
//     query.on('row', function (row) {
//         results.push(row);
//     });
//
//     //After all data is returned, close connection and return results
//     query.on('end', function () {
//       var obj = { groupname: results[0].groupname, title: results[0].title, content: results[0].content, creator: results[0].creator };
//
//         res.json(obj);
//         console.log("result: " + obj);
//     });
// });

app.put('/add/note', function (req, res) {
  var flatGroup = req.body.group;
  var title = req.body.notetitle;
  var content = req.body.notecontent;
  var owner = req.body.notecreator;
  var time = req.body.notetimestamp;
  console.log(title + ' groupname: ' + flatGroup + ' content: ' + content + ' owner: ' + owner + ' time: ' + time);

  var q = "insert into notes (groupname,content, creator, currtime, title) values ($1,$2, $3, $4, $5) RETURNING groupname, title, currtime, creator";
  var query = client.query(q, [flatGroup, content, owner, time, title]);
  var results = [];

  //error handler for /add user
  query.on('error', function () {
    res.status(500).send('Error, fail to add note ' + title);
  });

  //stream results back one row at a time
  query.on('row', function (row) {
    results.push(row);
  });

  //after all the data is returned close connection and return result
  query.on('end', function () {
    // var ob = JSON.stringify(results);

    // var message = {
    //   to: 'fMy0xAn8tuI:APA91bG31R55g-ATgUf6S7tZX-5pduA3F8qHmd406b94GrOR38G7UBDprKWG36LdIyv0ITXLBFJ0bdwVBWCmRLiMb6rFZ0XgvslU6v46smTiklcQUErw-7yMgyx6lTqILUv9I1pzdQjT', // required
    //   collapse_key: 'your_collapse_key',
    //   data: {
    //     your_custom_data_key: 'your_custom_data_value'
    //   },
    //   notification: {
    //     title: 'Title of your push notification',
    //     body: 'Body of your push notification'
    //   }
    // };

    console.log("Sending message");
    sendToUser('fMy0xAn8tuI:APA91bG31R55g-ATgUf6S7tZX-5pduA3F8qHmd406b94GrOR38G7UBDprKWG36LdIyv0ITXLBFJ0bdwVBWCmRLiMb6rFZ0XgvslU6v46smTiklcQUErw-7yMgyx6lTqILUv9I1pzdQjT', 'testing message');



    var obj = { groupname: results[0].groupname, title: results[0].title, creator: results[0].creator };
    res.json(obj);
    console.log("result: " + obj);
  });
});


//get group
app.get('/get/notes', function (req, res) {
  var groupName = req.query.gname;
  var groupPass = req.query.pass;
  console.log("get group, name: " + groupName);
  var q = "SELECT * FROM notes WHERE groupname=$1";
  var query = client.query(q, [groupName, groupPass]);

  var results = [];

  //error handler for /get_users
  query.on('error', function () {
    res.status(500).send('Error, fail to get users: ' + userEmail);
  });

  //stream results back one row at a time
  query.on('row', function (row) {
    results.push(row);
  });

  // fcm.send(message, function(err, response){
  //   console.log("in send message");
  //   if (err) {
  //     console.log("Something has gone wrong!");
  //   } else {
  //     console.log("Successfully sent with response: ", response);
  //   }
  // });

  //After all data is returned, close connection and return results
  query.on('end', function () {
    res.json(results);
    console.log("result: " + results[0]);
  });
});

function sendToUser(deviceId, message)
{
  request({
    method: 'PUT',
    preambleCRLF: true,
    postambleCRLF: true,
    uri: 'https://fcm.googleapis.com/fcm/send',
    multipart: [
      {
        'content-type': 'application/json',
        'Authorization': 'AIzaSyBi-6JXpT40KLFn4e6k0wLa9kdDFAbvnU0',
        body: JSON.stringify({'data': {'message':message}, 'to': deviceId})
      }
    ]
  },
  function (error, response, body) {
    if (error) {
      return console.error('upload failed:', error);
    }
    console.log('Upload successful!  Server responded with:', body);
  });
}

// function sendMessageToUser(deviceId, message)
// {
//   request({
//     url: 'https://fcm.googleapis.com/fcm/send',
//     method: 'POST',
//     headers: {
//       'Content-Type' :' application/json',
//       'Authorization': 'AIzaSyBi-6JXpT40KLFn4e6k0wLa9kdDFAbvnU0'
//     },
//     body: JSON.stringify({ "data": {"message": message},"to" : deviceId})
//   }, function(error, response, body) {
//     if (error) {
//       console.error(error, response, body);
//     }else if (response.statusCode >= 400) {
//       console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage+'\n'+body);
//     }else {console.log('Done!')}
//   });
// }

// sendMessageToUser("d7x...KJQ",{ message: 'Hello puf'});

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
