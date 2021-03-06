var Sequelize = require('sequelize');
var keys = require('./keys');

//we will eventually need to set environmental variables for all the input fields below
//NEED TO CHANGE THIS TO POINT TO LOCAL MYSQL
var db = new Sequelize('squirrel', keys.aws.username, keys.aws.password, {
  host: keys.aws.host, // <==== how to set host with many instances of db? 
  dialect: 'mysql',
  dialectOptions: '{{path}}amazon-rds-ca-cert.pem',
  port: '3306',
})

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

//A Like belongs to one Link.... a Like belongs to one user...?
Like.belongsTo(User); //<==TODO finish relationship here!
//link can have many likes... a like belongs to one user... 


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