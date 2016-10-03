//format 'userid%username'
var User = require('../../db/db-config').User;
var Link = require('../../db/db-config').Link;
var Category = require('../../db/db-config').Category;
var Like = require('../../db/db-config').Like;
var Tag = require('../../db/db-config').Tag;

module.exports = {
  // test route for Postman and Mocha TDD
  test: function(req, res, next){
    console.log(req, 'req test!');
    res.sendStatus(200);
  },

  // user Login or create new user API //
  login: function(req, res, next){
    console.log(req.body, req.params.userid, 'yololo');
    var userID = req.body.userID;
    var userName = req.body.name;
    var avatar = req.body.avatar;
    
    User.findById(userID)
      .then(function(user){
        if(user){
          console.log(user, 'checking here');
          res.send(user);
        } else {
          User.create({fbid: userID, fbname: userName, avatar: avatar})
            .then(function(user){
              console.log(userName + ' added to database');
              res.send(user); //<=== working here
            })
        }
      })
      .catch(function(err){
        console.log('login database err');
      })
  },

  // user request API // 
  getLinks: function(req, res, next){
    const userID = req.params.userid;
    const promises = [];

    Link.findAll({where:{owner: userID,},
      // order: [['createdAt', 'DESC']],
    })
    .then(function(data){
      console.log('please work', data)
      const mapped = data.map(function(curr){
        return curr.dataValues;
      });
      return mapped;
    })
    .then((data) => {
      const addPromise = function(id){
        return new Promise((res, rej) => {
          User.findById(id)
          .then((user)=>{
            if(user){
              const userObj = {[user.fbid]: user.fbname, avatar: user.avatar}
              res(userObj);
            } else {
              res();
            }
          })
        })
      }
      const tempStorage = {}
      data.forEach((curr2) => {
        if(curr2.assignee !== userID && !tempStorage[curr2.assignee]){
          promises.push(addPromise(curr2.assignee))
          tempStorage[curr2.assignee] = true;
        }
      });
      Promise.all(promises)
      .then((users) => {
        console.log('user?', users);
        const assigneeReferenceObj = {}
         
         users.forEach(function(curr){
          if(curr){
            for(var key in curr){
              if(key !== 'avatar'){
                assigneeReferenceObj[key] = {
                  name: curr[key],
                  avatar: curr.avatar
                };
              }
            }
          }
         })
        console.log('user2?', assigneeReferenceObj);
        res.send([data, assigneeReferenceObj]);
      })
    })
    .catch(function(err){
      console.log('could not get Links from database: db error');
    });
  },
  //getUser Friends Links.. limit 10? //
  getFriendsLinks: function(req, res, next) {
    //TODO TODO!!!!!
  },
  // add link to user // 
  putLinks: function(req, res, next){

    var userID = req.params.userid;
    console.log('Saving',req.body.url);
    Link.create({url: req.body.url, owner: userID, assignee: userID})
      .then(function(link){
        console.log(link);
        console.log('new link saved in putLinks');
        res.sendStatus(201);
        //should we be sending back the link to user for any reason? 
      })
      .catch(function(err){
        console.log('new link could not be saved in putLinks');
      })
  },
  // delete specific link from user //
  deleteLinks: function(req, res, next){
    var userID = req.params.userid;
    //make sure we only delete the instance where owner AND assignee are the same
    Link.findAll({
      where: {
      url: req.body.url,
      owner: userID,
      assignee: userID,
      }
    })
    .then(function(found){
      //delete all duplicates of this instance
      return found.forEach(function(link){
        link.destroy();
      })
    })
    .then(function(){
      res.send('link deleted');
    })
    .catch(function(err){
      console.log('delete Links service error');
    })
  },

  friendsGet: function(req, res, next){
    var userID = req.params.userid;
    //Below is how you access the 'friendship' table created by sequelize
    User.find({
      where:{fbid: userID},
      include:[{model: User, as: 'friend'}],
    })
    .then(function(data){
      var mappedFriends = data.friend.map(function(friend){
        return {fbid:friend.fbid, fbname:friend.fbname};
      })

      console.log(mappedFriends, 'mappedFriends Yolo')
      return mappedFriends;
    })
    .then(function(friendsArray){
      console.log(friendsArray, 'friendsArray Yolo')
      var promiseArray = [];
      friendsArray.forEach(function(friend){
        var updatedFriend = friend;
        console.log(friend.fbid, 'friend.fbid');
        var promise = new Promise(function(resolve,reject){
          Link.findAll({
            where: {owner: friend.fbid, assignee: friend.fbid}
          })
          .then(function(links){
              updatedFriend.links = links;
            resolve(updatedFriend);
          })
        })

        promiseArray.push(promise);
      })


      Promise.all(promiseArray)
      .then((values)=> {
        console.log(values, 'please for the love of god work!')
        res.send(values);
      })
    })
    .catch(function(err){
      res.send({friends:[]})
      console.log('could not get friends from db. DB error');
    })
  },
  // add friend to user
  friendsPut: function(req, res, next){
    var userID = req.params.userid;
    var friendID = req.body.friend;
    
    User.findOne({
      where:{fbid: userID}
    })
    .then(function(user){
      User.findOne({
        where:{fbid: friendID}
      })
      .then(function(friend){
        user.addFriend(friend);
        res.sendStatus(201);
      })
    })  
  },

  //friendsDELETE <===== TODO

  //put new link into friends folder
  putLinksFriend: function(req, res, next){
    console.log('adding link to friend');
    var userID = req.params.userid;
    var friendID = req.params.friendid;
    var url = req.body.link;

    Link.create({url:url, owner:friendID, assignee:userID})
    .then(function(link){
      console.log('You added a link for your friend!');
      res.send(link).sendStatus(201);
    })
  },

  //search for users  //GHETTO
  searchFriends: function(req, res, next) {
    var search = req.params.friend;
    console.log(search);
    User.findAll({
      where: {
        fbname: search
      }
    })
    .then((data)=>{
      res.send(data);
    })
  }
}