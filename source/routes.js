var AM = require('./modules/account-manager');
//var PM = require('./modules/profile-manager');
//var SG = require('./modules/sequence-generator');
var bodyParser = require('body-parser');

module.exports = function(app)
{
app.get('/', function (req, res, next) {
	  try {
		      res.render('index')
		    } catch (e) {
		      next(e)
		    }
})
app.get('/login', function (req, res, next) {
	  try {
		      res.render('user_reg');
		    } catch (e) {
		      next(e)
		    }
})
app.post('/login', function(req, res)
	{
		AM.addAccount({
			user : req.body['user'],
			pass : req.body['pass'],
			email : req.body['email']
		}, function(err)
		{
			if (err)
			{
				res.status(400).send(err);
			}
			else
			{
				res.status(200).send('The account was added!');
			}
		});
	});
};