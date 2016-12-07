//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    request = require('request'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);


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

//setup stream parameters
var streamParameters = {
  track:'trump'

}
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

                if(data.text & data.text !== null){
                  socket.emit('sentiment-stream', data.text);
                }

                console.log(data.text);

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
