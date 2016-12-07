//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    request = require('request'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
    mongodb = require('mongodb'),
    sentiment = require('sentiment')

//Setup twitter stream api
var twit = new twitter({
/*
  consumer_key: 'HS49PXCEYBhic9XXXcz8Op6hO',
  consumer_secret: '7J5aCLRYqWnbr7XaZHzW6u5m8UySbazjzglUrrs3OKvhwXSnWF',
  access_token_key: '554861590-hH3BjAyFReQoWqrFvHYEkVtXDM2pFDJ0x8EzWlGt',
  access_token_secret: '5GOFEFMfHOoaXoIRjsFIN6ScWGQvN6XCPX35DvHQBYfEL'
*/
consumer_key: "0D9VrKYphFdxTetbb7kEiEsiL",
consumer_secret: "Grymc6IpEkb8LZiDwUF4lei4mpQ7XzBJXtQoAGZDxn8751UryV",
access_token_key: "159238058-FGetuUbim8pIc7NAfvHNxxlqyhADpaUIyLUrT5Aj",
access_token_secret: "13Qgxn9aTha8U7IF78F14Y1ZKDO6KneKKc40rsDGDnTrJ"

}),
stream = null;

var counter = 0;
var sentcount = 0;

//setup stream parameters
var streamParameters = {
  track:'trump'

}

var MongoClient = mongodb.MongoClient;
var dbUrl = 'mongodb://localhost:27017/tweets';

// 'locations':'-180,-90,180,90'


//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup rotuing for app
app.use(express.static(__dirname + '/public'));

//Create web sockets connection.
io.sockets.on('connection', function (socket) {

  socket.on("start tweets", function() {

    if(stream === null) {
      //Connect to twitter stream passing in filter for entire world.
      twit.stream('statuses/filter', streamParameters, function(stream) {
          stream.on('data', function(data) {
/*
                if(data.text){
                  socket.emit('sentiment-stream', data.text);
                  var postData = {'txt': data.text};
                  var url = 'http://sentiment.vivekn.com/api/text/';
                  var options = {
                    method: 'post',
                    body: postData,
                    json: true,
                    url: url
                  }

                  request(options, function(err, res, body){
                    console.log(res);
                    console.log(body);
                  })
                }
*/
                //console.log(data.text);
                if(data.text != null){
                var sent = sentiment(data.text);
                tweet_sentiment = sent.score;
                counter += 1;
                sentcount += sent.score;
                //console.log(sentcount/counter);


                if (data.coordinates & data.coordinates !== null){
                  //If so then build up some nice json and send out to web sockets
                  var outputPoint = {"lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1]};

                  socket.broadcast.emit("twitter-stream", outputPoint);

                  //Send out to web sockets channel.
                  socket.emit('twitter-stream', outputPoint);
                }


                else if(data.place != null){
                  centerLat = data.place.bounding_box.coordinates[0][1][0];
                  centerLng = data.place.bounding_box.coordinates[0][1][1];
                    var outputPoint = {"lat": centerLat,"lng": centerLng};
                    socket.broadcast.emit("twitter-stream", outputPoint);

                  }
                  if(outputPoint !== undefined){
                    outputPoint = null;
                  }
                  if(data.text == null){
                    var tweet = null;
                  }
                  else if(data.text != null){
                    var tweet = data.text;
                  }
                  mongodb.connect(dbUrl, function(err,db){
                    if(err){
                      console.log(err)
                    } else{
                    var doc = {text : data.text, date : data.created_at, sent : tweet_sentiment, coordinates : outputPoint}

                    db.collection('tweets').insertOne(doc, function(err, result){
                      console.log("Successfully inserted");
                      db.close();

                      });
                    }
                    });

                  }



              stream.on('limit', function(limitMessage) {
                return console.log(limitMessage);
              });

              stream.on('warning', function(warning) {
                return console.log(warning);
              });

              stream.on('disconnect', function(disconnectMessage) {
                return console.log(disconnectMessage);
              });

          });
      });
    }
  });

    // Emits signal to the client telling them that the
    // they are connected and can start receiving Tweets
    socket.emit("connected");
});
