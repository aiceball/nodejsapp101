var config = {
	user: 'uuwfugiqgqhqnf',
	database: 'd28f8fbcb9h2bs',
	password: '3d8b2018c28fe6a3b1b61c8e6366ece388d3667c032fd9214546bc3f923e9e72',
	host: 'ec2-54-235-173-161.compute-1.amazonaws.com',
	port: '5432',
	max: 10,
	idleTimeoutMillis: 3000,
};
//var bcrypt = require('bcryptjs'),
var Q = require('q');
var pg = require('pg');
pg.defaults.ssl = true;
var pool = new pg.Pool(config);
exports.localReg = function (username, password) {
  var deferred = Q.defer();
  var collection={};
  pool.connect(function (err, db) {
  	db.query('SELECT * FROM public.users', function(err, res)
		{
			console.log(res.rows);
			collection=res.rows[0];
		});

    //check if username is already assigned in our database
    // collection.findOne({'username' : username})
    //   .then(function (result) {
    //     if (null != result) {
    //       console.log("USERNAME ALREADY EXISTS:", result.username);
    //       deferred.resolve(false); // username exists
    //     }
    //     else  {
    //       var hash = bcrypt.hashSync(password, 8);
    //       var user = {
    //         "username": username,
    //         "password": hash,
    //         "avatar": "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG"
    //       }

    //       console.log("CREATING USER:", username);

    //       collection.insert(user)
    //         .then(function () {
    //           db.close();
    //           deferred.resolve(user);
    //         });
    //     }
    //   });
  });

  return deferred.promise;
};