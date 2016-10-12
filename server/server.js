var app = require('express')();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var routes = require('./config/routes');
var Sequelize = require('sequelize');
var cors = require('cors');

//== test data base ===//
var User = require('../db/db-config').User;
var Link = require('../db/db-config').Link;
var Tag = require('../db/db-config').Tag;
var Like = require('../db/db-config').Like;
var Category = require('../db/db-config').Category;
//instantiate db ORM
var db = require('../db/db-config').db;

db.authenticate()
.then(function() {

  User.findOne({
    where: {
      fbname: 'FAKEPASSWORD'
    }
  })
  .then(function(guy) {
    // User.create({fbid:'TESTINGMULTIDBagain', fbname:'12345'})
    // .then(function(user){
    //   console.log(user);
    // })
   console.log(guy);
  })
  console.log('connected to db');
})


  // HOW TO GET ALL THE LIKES OF A PARTICULAR LINK!
  // Link.findOne({
  //   where: {
  //     url: 'http://www.cnn.com/2016/09/29/africa/china-african-donkeys/index.html',
  //     owner: '10105564501516258'
  //   }
  // })
  // .then(function(link) {
  //   link.getLinkLikes()
  //   .then(function(data){
  //     console.log(data, 'WHATS HERE MOFO!')
  //   })
  // })
  
  // User.create({fbid:'mwongka', fbname:'1234'})
  // .then(function(user){
  //   console.log(user);
  // })


 // use below code to delete links! 
  // Link.findOne({
  //   where: {
  //     url: 'http://www.cnn.com/2016/09/29/africa/china-african-donkeys/index.html',
  //     owner: '10105564501516258'
  //   }
  // })
  // .then(function(links){
  //   console.log(links, 'data values');
  //   Like.create()
  //   .then(function(like){
  //     like.setLink(links.dataValues.id)
  //     like.setUser('10105564501516258')
  //   });
  // });

  // Link.create({url: 'http://www.cnn.com/2016/10/03/middleeast/isis-attack-kurdish-wedding-party-syria/index.html', owner: '10154660869289363', assignee: '10154660869289363'})
  // .then(function(link){
  //   console.log('link created');
  // })

 //  User.findById('10154660869289363')
 //    .then(function(user){
 //      User.create({fbid: '10154660869289363', fbname: 'Jordan Taylor'})
 //      .then(function(user2){
 //        console.log(user, user2, 'yolo')
 //        user.addFriend(user2);
 //      })
 //    })
// })
.catch(function(err){
  console.log(err);
  console.log('sequelize connection error');
});


/* DO NOT DELETE SYNC BELOW! 
/* Uncommment portion below to resync database (drop tables)
as well as to add relational sequelize methods to it's model instances!
A few intances will be created every time to test the database */
    // COMMENT THIS OUT LATER

      // db.sync({force: true})
      //   .then(function(){
      //     console.log('sycn success!');
      //     User.create({fbid: '928374', fbname: 'Michael Wong'})
      //       .then(function(user){
      //         User.create({fbid: 'ast294r', fbname:'Squirrel'})
      //         .then(function(user2){
      //           user.addFriend(user2);
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