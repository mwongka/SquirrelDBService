function forwardrequests(req,res,next){
	console.log('HERHER')
	var userid = req.url.split('/')[req.url.split('/').length - 1]
	var loginname = req.body.username || req.body.userId || req.params.userid || userid;
	console.log('LoginNameis',loginname);
	console.log('LENGTH',global.schemas.length)
	var dbindex = hash(loginname);
	console.log('INDEX',dbindex);
	global.currentdb = global.schemas[dbindex];
	console.log(global.currentdb)
	var helpers = require('./helpers');
	// var url = dbs[dbindex] + req.url;
	// console.log('url',url);
	// var method = req.method;
	// var data = req.data || {};

	// switch(method){
	// 	case 'GET':
	// 		axios.get(url).then(function(dbres){
	// 			res.end(dbres.data)
	// 		})
	// 		break;
	// 	case 'POST':
	// 		axios.post(url,data).then(function(dbres){
	// 			res.end(dbres.data);
	// 		})	
	// 		break;
	// 	case 'PUT':
	// 		axios.put(url,data).then(function(dbres){
	// 			res.end(dbres.data)
	// 		})
	// 		break;
	// 	case 'DELETE':
	// 		axios.delete(url).then(function(dbres){
	// 			res.end(dbres.data)
	// 		})
	// 	break;	
	// 	default:
	// 		console.log('Cant find')

	// }

	function hash(str){
		var sum = str.split('').reduce(function(previousvalue,currvalue,currindex,array){
			return previousvalue + currvalue.charCodeAt(0);
		},0);
		//console.log('HASHED TO DB AT INDEX', sum % dbs.length);
		return sum % global.schemas.length;
	}





	  global.app.get('/test/:first', helpers.test);

	  global.app.post('/posttest',helpers.posttest);

	  global.app.post('/test',helpers.posttest);

	  global.app.post('/signup', helpers.signup);

	  global.app.post('/login/:userid', helpers.login);

	  global.app.post('/login2', helpers.login2);

	  global.app.post('/deserialize', helpers.deserialize);

	 global.app.get('/links/:userid', helpers.getLinks);

	  global.app.get('/links/friends/:friendid', helpers.getFriendsLinks);

	  global.app.put('/links/:userid', helpers.putLinks);

	  global.app.delete('/links/:userid', helpers.deleteLinks);

	  global.app.get('/friends/:userid', helpers.friendsGet);

	  global.app.get('/friends/nameOnly/:userid', helpers.friendsGetNameOnly);

	  global.app.put('/friends/:userid', helpers.friendsPut);
	  //may need to modify endpoint below.. may just route to app.put/links?
	  global.app.put('/links/friends/:friendid/:userid', helpers.putLinksFriend);

	  global.app.get('/search/:friend', helpers.searchFriends);

	  global.app.put('/likes', helpers.putLike);

	  global.app.get('/test',helpers.test)




	next();
}

module.exports = forwardrequests;