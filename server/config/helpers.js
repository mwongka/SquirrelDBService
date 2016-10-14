//format 'userid%username'
require('../../db/db-config')
// var Link = require('../../db/db-config').Link;
// var Category = require('../../db/db-config').Category;
// var Like = require('../../db/db-config').Like;
// var Tag = require('../../db/db-config').Tag;

console.log('HERE');
console.log('CURRENTDB',global.currentdb);

global.Link = global.currentdb.Link;
global.User = global.currentdb.User;
global.Category = global.currentdb.Category;
global.Like = global.currentdb.Like;
global.Tag = global.currentdb.Tag;

module.exports = {
  // test route for Postman and Mocha TDD
  getMostRecent: function(req, res, next) {
    // console.log('testtest!>>>>>>>>>>>>>>>>>>>>>>>>>');

    global.Link.findAll({limit: 60, order: 'createdAt DESC'})
      .then(function(data) {
        console.log('give me redis data!');
        res.send(data);
      }).catch(function(error) {
        console.log('Error in finding data for redis D=');
      });
    },
  test: function(req, res, next){
    console.log('TEST')
    res.end("TESTED");
  },
  posttest: function(req,res,next){
    console.log('params',req.params);
    console.log('data',req.data);
    console.log('body',req.body)
    res.send('GOT HERE');
  },
  signup: function(req, res, next) {
    // console.log('SIGNED UP');
    // console.log('prKeys',User.primaryKeys);
    // console.log('attr',User.attributes);
    console.log(req.body, 'req body here');
    const username = req.body.username;
    const password = req.body.password;
    console.log('username',username,'pword',password)

    global.User.findById(username)
    .then(function(user){
      console.log('USER',user);
      if(user) {
        res.send(404);
      } else {
        console.log('CREATING');
        global.User.create({fbid: username, fbname: password})
        .then(function(user){
          res.send(user); //<=== working here
        });
      }
    });
  },

  // user Login or create new user API //
  login: function(req, res, next) {

    const userID = req.body.username; //isthis now the unique username? 
    const userName = req.body.password; //isthis now the unique password? 
    const avatar = req.body.avatar;
    
    global.User.findById(userID)
      .then(function(user){
        if(user){
          res.send(user);
        } else {
          global.User.create({fbid: userID, fbname: userName, avatar: avatar})
            .then(function(user){
              res.send(user); //<=== working here
            });
        }
      })
      .catch(function(err) {

      });
  },

  login2: function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    global.User.findById(username)
    .then(function(user){
      if(user && user.fbname === password) {
        res.send(user);
      } else {
        res.send(404);
      }
    });
  },

  deserialize: function(req, res, next) {
    var userID = req.body.username;

    global.User.findById(userID)
      .then(function(user){
        if(user){
          res.send(user);
        } else {
          res.send('not found');
        }
      })
      .catch(function(err) {
        res.send(404);
      });
  },
  // user request API // 
  getLinks: function(req, res, next){

    const userID = req.params.userid;
    const promises = [];

    global.Link.findAll({where:{owner: userID,},
      // order: [['createdAt', 'DESC']],
    })
    .then(function(data) {

      const mapped = data.map(function(curr) {
        return curr.dataValues;
      });
      return mapped;
    })
    .then((data) => {
      const addPromise = function(id) {
        return new Promise((res, rej) => {
          global.User.findById(id)
          .then((user)=>{
            if (user) {
              const userObj = {[user.fbid]: user.fbname, avatar: user.avatar};
              res(userObj);
            } else {
              res();
            }
          });
        });
      };
      const tempStorage = {};
      data.forEach((curr2) => {
        if (curr2.assignee !== userID && !tempStorage[curr2.assignee]) {
          promises.push(addPromise(curr2.assignee));
          tempStorage[curr2.assignee] = true;
        }
      });
      Promise.all(promises)
      .then((users) => {

        const assigneeReferenceObj = {};
         
        users.forEach(function(curr) {
          if (curr) {
            for (var key in curr) {
              if (key !== 'avatar') {
                assigneeReferenceObj[key] = {
                  name: curr[key],
                  avatar: curr.avatar
                };
              }
            }
          }
        });

        res.send([data, assigneeReferenceObj]);
      });
    })
    .catch(function(err) {

    });
  },
  //getUser Friends Links.. limit 10? //
  getFriendsLinks: function(req, res, next) {
    var friendID = req.params.friendid;

    global.Link.findAll({
      where: {
        owner: friendID,
        assignee: friendID,
      }
    })
    .then((friendsLinks) => {
      res.send(friendsLinks);
    })
    .catch((err) => {

    });
  },
  // add link to user // 
  putLinks: function(req, res, next){
    console.log('Added link');
    var userID = req.params.userid;

    global.Link.create({url: req.body.url, owner: userID, assignee: userID})
      .then(function(link){
        res.sendStatus(201);
        //should we be sending back the link to user for any reason? 
      })
      .catch(function(err) {

      });
  },
  // delete specific link from user //
  deleteLinks: function(req, res, next) {
    var userID = req.params.userid;
    //make sure we only delete the instance where owner AND assignee are the same
    global.Link.findAll({
      where: {
        url: req.body.url,
        owner: userID,
        assignee: userID,
      }
    })
    .then(function(found) {
      //delete all duplicates of this instance
      return found.forEach(function(link) {
        link.destroy();
      });
    })
    .then(function() {
      res.send('link deleted');
    })
    .catch(function(err) {

    });
  },

  friendsGet: function(req, res, next) {
    console.log('goodbye damien');
    var userID = req.params.userid;
    //Below is how you access the 'friendship' table created by sequelize
    global.User.find({
      where:{fbid: userID},
      include:[{model: User, as: 'friend'}],
    })
    .then(function(data) {
      var mappedFriends = data.friend.map(function(friend) {
        return {fbid: friend.fbid, fbname: friend.fbname, avatar: friend.avatar};
      });
      return mappedFriends;
    })
    .then(function(friendsArray) {

      var promiseArray = [];
      friendsArray.forEach(function(friend) {
        var updatedFriend = friend;
        var promise = new Promise(function(resolve,reject){
          global.Link.findAll({
            where: {owner: friend.fbid, assignee: friend.fbid}
          })
          .then(function(links) {
            updatedFriend.links = links;
            resolve(updatedFriend);
          });
        });

        promiseArray.push(promise);
      });


      Promise.all(promiseArray)
      .then((values)=> {

        res.send(values);
      });
    })
    .catch(function(err) {
      res.send({friends: []});

    });
  },

  friendsGetNameOnly: function(req, res, next) {
    var userID = req.params.userid;
    global.User.find({
      where:{fbid: userID},
      include:[{model: User, as: 'friend'}],
    })
    .then((data) => {
      res.send(data.friend);
    });
  },
  // add friend to user
  friendsPut: function(req, res, next) {
    var userID = req.params.userid;
    var friendID = req.body.friend;
    
    global.User.findOne({
      where:{fbid: userID}
    })
    .then(function(user){   
      global.User.findOne({
        where:{fbid: friendID}
      })
      .then(function(friend) {
        if(friend===null){
          console.log('INSIDE',friendID)
          //add friend to DB, and add friendslinks
          if(global.currentdb === global.schemas[0]){
            global.currentdb = global.schemas[1];
            global.Link = global.currentdb.Link
            global.User = global.currentdb.User
            global.Category = global.currentdb.Category
            global.Like = global.currentdb.Like
            global.Tag = global.currentdb.Tag
          } else {
            global.currentdb = global.schemas[0];
            global.Link = global.currentdb.Link
            global.User = global.currentdb.User
            global.Category = global.currentdb.Category
            global.Like = global.currentdb.Like
            global.Tag = global.currentdb.Tag
          }
          global.User.findOne({
            where:{fbid: friendID}
          }).then(function(friend){
              if(global.currentdb === global.schemas[0]){
                global.currentdb = global.schemas[1];
                global.Link = global.currentdb.Link
                global.User = global.currentdb.User
                global.Category = global.currentdb.Category
                global.Like = global.currentdb.Like
                global.Tag = global.currentdb.Tag
              } else {
                global.currentdb = global.schemas[0];
                global.Link = global.currentdb.Link
                global.User = global.currentdb.User
                global.Category = global.currentdb.Category
                global.Like = global.currentdb.Like
                global.Tag = global.currentdb.Tag
              }
              global.User.create({fbid: friend.dataValues.fbid, fbname: friend.dataValues.fbid})
              .then(function(createdFriend){
                console.log('USER',user);
                console.log('Created',createdFriend); //<=== working here
                user.addFriend(createdFriend);
                res.end('Created and friended');
              });

          });
        } else {
        console.log('user',user);
        // console.log('FRIEND IS',friend)
        user.addFriend(friend);
        res.sendStatus(201);
      }
      });
    });  
  },

  //friendsDELETE <===== TODO

  //put new link into friends folder
  putLinksFriend: function(req, res, next) {

    var userID = req.params.userid;
    var friendID = req.params.friendid;
    var url = req.body.link;
    var dbindex = hash(friendID);
    console.log('INDEX',dbindex);
    global.currentdb = global.schemas[dbindex];
    global.Link = global.currentdb.Link;
    global.User.findById(userID)
    .then(function(user){
      console.log('USER',user);
      if(user) {
      } else {
        console.log('CREATING');
        global.User.create({fbid: username, fbname: password})
        .then(function(user){
          res.header('yo');
          res.send(user); //<=== working here
        });
      }
    });

    global.Link.create({url:url, owner:friendID, assignee:userID})
    .then(function(link){
      res.header('yo');
      res.send(link);
    });

    var dbindex = hash(userID);
    console.log('INDEX',dbindex);
    global.currentdb = global.schemas[dbindex];
    global.Link = global.currentdb.Link;


      function hash(str){
        var sum = str.split('').reduce(function(previousvalue,currvalue,currindex,array){
          return previousvalue + currvalue.charCodeAt(0);
        },0);
        //console.log('HASHED TO DB AT INDEX', sum % dbs.length);
        return sum % global.schemas.length;
      }

  },
// 
  //search for users  //GHETTO
  searchFriends: function(req, res, next) {
     global.currentdb = global.schemas[1];
    console.log('HEREIAM')
    global.User = global.currentdb.User

    function hash(str){
      var sum = str.split('').reduce(function(previousvalue,currvalue,currindex,array){
        return previousvalue + currvalue.charCodeAt(0);
      },0);
      //console.log('HASHED TO DB AT INDEX', sum % dbs.length);
      return sum % global.schemas.length;
    }

    var search = req.params.friend;
    // var dbindex = hash(search);
    // console.log('INDEX',dbindex);
    // global.currentdb = global.schemas[dbindex];
    // global.Link = global.currentdb.Link;
    // global.User = global.currentdb.User;

    global.User.findAll({
      where: {
        fbid: search
      }
    })
    .then((data)=>{
      console.log('TRUTH',global.currentdb === global.schemas[0]);

      if(data.length === 0){
        console.log('HERE');
        global.currentdb = (global.currentdb === global.schemas[0] ? global.schemas[1]:global.schemas[0])
        console.log('TRUTH',global.currentdb === global.schemas[0]);
        global.Link = global.currentdb.Link;
        global.User = global.currentdb.User;
        global.User.findAll({
          where:{fbid:search}
        }).then(function(data){
          res.header = "yo";
          res.send(data);
        })
      } else {
      // var dbindex = (dbindex === 0 ? 1:0);
      // console.log('INDEX',dbindex);
      // // global.currentdb = global.schemas[dbindex];
      // // global.Link = global.currentdb.Link;
      // // global.User = global.currentdb.User;
      res.header = "yo";
      res.send(data);
    }
    });
  },
  test:function(req,res,next){
    console.log('query',req.query)
    console.log('body',req.body);
    console.log('params',req.params);
    res.end('Reached test',req.body);
  },

  //add Like for specific link. (One user can like a specific Link ID ONCE ONLY)
  putLike: function(req, res, next) {
    var likedBy = req.body.userId;
    var likedLink = req.body.url;
    var linkOwner = req.body.owner;
  
    global.Link.findOne({
      where: {
        url: likedLink,
        owner: linkOwner,
      }
      })
      .then(function(link){
        global.Like.findOne({
          where: {
            linkId: link.dataValues.id,
            userFbid: likedBy,
          }
        })
        .then(function(like){
          if(like === null) {
            global.Like.create()
            .then(function(newLike){
              newLike.setLink(link.dataValues.id);
              newLike.setUser(likedBy);
              res.sendStatus(200);
            });
          } else {
            res.send('already exists');
          }
        });
      })
      .catch(function(err) {

      });
  }
};