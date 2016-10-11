var app = require('express')();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var routes = require('./config/routes');
var Sequelize = require('sequelize');
var cors = require('cors');
//app.use(require('config/routes.js'))

//== test data base ===//
var User = require('../db/db-config').User;
var Link = require('../db/db-config').Link;
var Tag = require('../db/db-config').Tag;
var Like = require('../db/db-config').Like;
var Category = require('../db/db-config').Category;

//instantiate db ORM
//var db = require('../db/db-config').db;


global.currentdb.DB.authenticate()
.then(function(){
  console.log('connected to db');

  global.User.findOne({
    where: {
      fbname: 'ULTRAFAKE'
    }
  })
  .then(function(guy) {
    
    global.Link.findOne({
      where: {
        owner:'JAKE'
      }
    }).then(function(link){
      console.log('LINK',link);
    })

   console.log(guy);
  })
  console.log('connected to db');
})

.catch(function(err){
  console.log(err);
  console.log('sequelize connection error');
});


/* DO NOT DELETE SYNC BELOW! 
/* Uncommment portion below to resync database (drop tables)
as well as to add relational sequelize methods to it's model instances!
A few intances will be created every time to test the database */
    // COMMENT THIS OUT LATER

      // global.currentdb.DB.sync({force: true})
      //   .then(function(){
      //     console.log('sycn success!');
      //     global.User.create({fbid: '928374', fbname: 'Michael Wong'})
      //       .then(function(user){
      //         global.User.create({fbid: 'ast294r', fbname:'Squirrel'})
      //         .then(function(user2){
      //           // global.user.addFriend(user2);
      //           // Link.create({url:"www.test.com", owner:user.fbid, assignee:user2.fbid})
      //           // .then(function(link){
      //           //   console.log('link saved!');
      //           //   Like.create({like: true})
      //           //   .then(function(like){
      //           //     console.log('like instance created');
      //           //   })
      //           // })
      //         })  
      //         console.log('users saved');
      //       })
      //   })
      //   .catch(function(err){
      //     console.log(err, 'could not sync');
      //   }); // <=== force sync to refresh

//connect middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

//connect routes
routes(app);

//set env variables 
var port = process.env.PORT || 8888;

app.listen(port, function() {
  console.log('app listening on port ' + port);
});