function forwardrequests(req,res,next){
	var userid = req.url.split('/')[req.url.split('/').length - 1]
	var loginname = req.body.username || req.body.userId || req.params.userid || userid;
	console.log('LoginNameis',loginname);
	var dbindex = hash(loginname);
	var url = dbs[dbindex] + req.url;
	console.log('url',url);
	var method = req.method;
	var data = req.data || {};

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
		return sum % dbs.length;
	}
	next();
}

module.exports = forwardrequests;