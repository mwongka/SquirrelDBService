var Sequelize = require('sequelize');
var keys = require('./keys');


//we will eventually need to set environmental variables for all the input fields below
//NEED TO CHANGE THIS TO POINT TO LOCAL MYSQL
//sets up a bunch of AWS servers here and redirect based on fbid
var connections = [];
keys.dbs.forEach(function(db){
  connections.push(
    new Sequelize(db.dbname, db.username, db.password, {
      host: db.host, // <==== how to set host with many instances of db? 
      dialect: 'mysql',
      dialectOptions: '{{path}}amazon-rds-ca-cert.pem',
      port: '3306',
    })
  )
})

var db = connections[0]


// var db = new Sequelize('squirrel', keys.aws.username, keys.aws.password, {
//  host: keys.aws.host, // <==== how to set host with many instances of db? 
//  dialect: 'mysql',
//  dialectOptions: '{{path}}amazon-rds-ca-cert.pem',
//  port: '3306',
// })



var Link = require('./models/link')(db);
var User = require('./models/user')(db);
var Category = require('./models/category')(db);
var Like = require('./models/like')(db);
var Tag = require('./models/tag')(db);
// var FriendShip = require('./models/friend')(db);

// set up relationship
//User can have many Link... a Link belongs to User. One-to-Many user#addLink
User.hasMany(Link);
Link.belongsTo(User);

//A Category can have many Link... a Link belongs to one Category. One-to-Many category#addLink <== adds categoryID to Link instance
Category.hasMany(Link);
Link.belongsTo(User);

//A Link can have many Tags... a Tag belongs to a Link?
Link.hasMany(Tag);
Tag.belongsTo(Link);

Like.belongsTo(Link); // When creating new Like instance.. youc an now use like.setUser, and like.setLink!
Like.belongsTo(User);// this userID on every 'like' instance will refer to the person who issued the like. NOT the person who is receiving it. //ONLY ONE PERSON CAN LIKE ONE ARTICLE

Link.hasMany(Like, {as: 'LinkLikes'}); // will allow us to quickly grab a link count
User.hasMany(Like, {as: 'UserLikes'}); // should allow us to get all likes this user has issued and figure out 'recommended categoreis?'
//A User belongs to many Users and vice-versa as Friend Many-to-Many user#addFriend
User.belongsToMany(User, {as: 'friend', through: 'friendship'}); // can i specify through: Friend Model?

// export db and models for use in other modules 
module.exports = {
  db: db,
  Link: Link,
  User: User,
  Tag: Tag,
  Like: Like,
  Category: Category,
}