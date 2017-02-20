var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  //authorize(JSON.parse(content), listEvents);
  	var listOfEvents = readEvent('2017-01-16');
	for(i=0;i<listOfEvents.length;i++){
   		authorize(JSON.parse(content), insertEvent, listOfEvents[i]);
   	}
});
function parseTime(timeElement, startingDate){
	//possible time elements
	//TuTh 4:15PM - 5:30PM
	//We 9:45AM - 11:25AM
	//End format: 2017-01-16T09:00:00-07:00	which is YYYY-MM-DDThh:mm-hh:mm
	var parsedElement = {
	  'start': {
	    'dateTime': '2017-01-16T09:00:00',
	    'timeZone': 'America/Montreal',
	  },
	  'end': {
	    'dateTime': '2017-01-16T17:00:00',
	    'timeZone': 'America/Montreal',
	  },
	  'recurrence': [
	    'RRULE:FREQ=DAILY;COUNT=2'
	    // 'EXDATE:'
	  ]
	};
	var splitArrayOfTime = timeElement.split(" ");
	var days = splitArrayOfTime[0];	//2letters per day, max of 2 days (TuTh) indicates additional recurrence if 2 days

	var startTime = splitArrayOfTime[1]; //format of hh:mm(AM|PM), am - offset 0, pm - offset 12
	//console.log("prev: "+startTime.length);
	if(startTime.length!=7)
		startTime='0'+startTime;
	//console.log("after: "+startTime.length);
	if(startTime[5]=='A')
		startTime=startTime.substring(0,5);
	//console.log("modified am: "+startTime);
	if(startTime[5]=='P')
		startTime=parseInt(startTime.substring(0,2))==12?(parseInt(startTime.substring(0,2)))+startTime.substring(2,5):(parseInt(startTime.substring(0,2))+12)+startTime.substring(2,5);
	//console.log("modified pm: "+startTime);

	var endTime = splitArrayOfTime[3]; //format of hh:mm(AM|PM), am - offset 0, pm - offset 12
	if(endTime.length!=7)
		endTime='0'+endTime;
	if(endTime[5]=='A')
		endTime=endTime.substring(0,5);
	if(endTime[5]=='P')
		endTime=parseInt(endTime.substring(0,2))==12?(parseInt(endTime.substring(0,2)))+endTime.substring(2,5):(parseInt(endTime.substring(0,2))+12)+endTime.substring(2,5);

	parsedElement.start.dateTime=startingDate+'T'+startTime+":00";
	parsedElement.end.dateTime=startingDate+'T'+endTime+":00";
	parsedElement.recurrence[0]="RRULE:FREQ=WEEKLY;COUNT=16;WKST=MO;BYDAY="+(days.length>2?days.substring(0,2).toUpperCase()+
		","+days.substring(2,4).toUpperCase():days.substring(0,2).toUpperCase());
	// parsedElement.recurrence[1]="EXDATE;TZID=America/Montreal:"+startingDate+'T'+startTime+":00";
	return parsedElement;
}
function readEvent(startingDate){
	var tempArray=[];
	var eventElement={
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'popup', 'minutes': 10},
    ],
  },};
	i=0;
	var arrayOfText = require('fs').readFileSync('testFile.txt').toString().split('\r\n');
	for(i=0;i<arrayOfText.length;i++){
		if(i%5==0)
			continue;
		//class name (ENGR248)
		else if(i%5==1)
			eventElement.summary=arrayOfText[i];
		//class Type (lecture/etc)
		else if(i%5==2)
			eventElement.description=arrayOfText[i];
		//class time (gotta format it)
		else if(i%5==3){
			var temp = parseTime(arrayOfText[i],startingDate);
			//console.log(temp);
			eventElement.start=temp.start;
			eventElement.end=temp.end;
			eventElement.recurrence=temp.recurrence;
		}
		//class location (h whatever)
		else if(i%5==4){
			eventElement.location=arrayOfText[i];
			//console.log(eventElement);	
			tempArray.push(eventElement);
			eventElement={
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'popup', 'minutes': 10},
    ],
  },};
		}

		//console.log(eventElement);
	}
	return tempArray;
}
//console.log(readEvent('2017-01-16'));

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback,event) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      console.log('fuck---------------------');
      callback(oauth2Client,event);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      console.log('Upcoming 10 events:');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        console.log('%s - %s', start, event.summary);
      }
    }
  });
}


function insertEvent(auth, event) {
		var calendar = google.calendar('v3');
		calendar.events.insert({
	  	auth: auth,
	  	calendarId: 'primary',
	  	resource: event,
		}, function(err, event) {
		  if (err) {
		    console.log('There was an error contacting the Calendar service: ' + err);
		    return;x	
		  }
		  console.log('Event created: %s', event.htmlLink);
		});
	}