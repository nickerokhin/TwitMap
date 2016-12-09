// setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    request = require('request'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    //io = require('socket.io').listen(server);
    socketio = require('socket.io'),
    mongodb = require('mongodb'),
    sentiment = require('sentiment');

// setup the twitter stream service
var TwitterStreamService = function(server){
    var self = this;
    var io = socketio(server);
    var clientcount = 0;

    var counter = 0;
    var sentcount = 0;

    var stream = null;

    var twit = new twitter({
      /*
        // lauren's keys
        consumer_key: 'HS49PXCEYBhic9XXXcz8Op6hO',
        consumer_secret: '7J5aCLRYqWnbr7XaZHzW6u5m8UySbazjzglUrrs3OKvhwXSnWF',
        access_token_key: '554861590-hH3BjAyFReQoWqrFvHYEkVtXDM2pFDJ0x8EzWlGt',
        access_token_secret: '5GOFEFMfHOoaXoIRjsFIN6ScWGQvN6XCPX35DvHQBYfEL'
      */
        /* nick's keys */
        consumer_key: "0D9VrKYphFdxTetbb7kEiEsiL",
        consumer_secret: "Grymc6IpEkb8LZiDwUF4lei4mpQ7XzBJXtQoAGZDxn8751UryV",
        access_token_key: "159238058-FGetuUbim8pIc7NAfvHNxxlqyhADpaUIyLUrT5Aj",
        access_token_secret: "13Qgxn9aTha8U7IF78F14Y1ZKDO6KneKKc40rsDGDnTrJ"

    });

    // socket manager
    var SetupSocketCallback = function(){
        io.sockets.on('connection', function (socket) {
            if(stream !== null && clientcount === 0){
                stream.start();
                console.log(new Date() + ' - Restarted streaming.');
            }
            clientcount++;
            socket.emit("connected");

            socket.on('start tweets', function() {
                if(stream === null)
                    SetupTwitterStreamCallback(socket);
                    //socket.emit("connected");
                    //socket.broadcast.emit("new-tweet", tweet);
                    //socket.emit('new-tweet', tweet);
            });

            socket.on('disconnect', function() {
                clientcount--;
                if(clientcount < 1){
                    stream.stop();
                }
            });
        });
    }

    SetupTwitterStreamCallback = function(socket){
        var MongoClient = mongodb.MongoClient;
        var dbUrl = 'mongodb://localhost:27017/tweets';

        twit.stream('statuses/filter', {'locations':'-180,-90,180,90', 'language':'en'}, function(stream) {
            stream.on('data', function(data) {
                if(data.text != null){
                    var sent = sentiment(data.text);
                    tweet_sentiment = sent.score;
                    counter += 1;
                    sentcount += sent.score;

                    if (data.coordinates & data.coordinates !== null){
                        //If so then build up some nice json and send out to web sockets
                        //var outputPoint = {"lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1]};
                      var outputPoint = {"lat": data.coordinates.coordinates[0],"lng": data.coordinates.coordinates[1]};
                    }

                    else if(data.place != null){
                        centerLat = data.place.bounding_box.coordinates[0][1][0];
                        centerLng = data.place.bounding_box.coordinates[0][1][1];
                        var outputPoint = {"lat": centerLat,"lng": centerLng};
                        //socket.broadcast.emit("new-tweet", data);
                        socket.emit("new-tweet", data)
                    }

                    if(data.text == null){
                        var tweet = null;
                    }
                    else if(data.text != null){
                        var tweet = data.text;
                    }

                    // load tweets into mongodb
                    mongodb.connect(dbUrl, function(err,db){
                        if(err){
                            console.log(err)
                        }
                        else{
                            var doc = {text : data.text, date : data.created_at, sent : sentiment, coordinates : outputPoint}

                            db.collection('tweets').insertOne(doc, function(err, result){
                                console.log("Successfully inserted");
                                db.close();
                            });
                        }
                    });
                }

                stream.on('connect', function(request) {
                    console.log(new Date() + ' - Connected to Twitter stream API.');
                });

                stream.on('reconnect', function (request, response, connectInterval) {
                    console.log(new Date() + ' - Trying to reconnect to Twitter stream API in ' + connectInterval + ' ms.');
                  });

                stream.on('limit', function(limitMessage) {
                    return console.log(limitMessage);
                    // new below
                    socket.broadcast.emit("stream-limit");
                    socket.emit('stream-limit');
                });

                stream.on('warning', function(warning) {
                    return console.log(warning);
                });

                stream.on('disconnect', function(disconnectMessage) {
                    return console.log(disconnectMessage);
                });
                stream.on('error', function(error) {
                    console.log(new Date() + ' - Twitter stream error: %j', error);
                    // new below
                    socket.broadcast.emit("stream-error");
                    socket.emit('stream-error');
                });

          });
    });
    } // close setup twitterstreamcallback

    self.StartService = function(){
        SetupSocketCallback();
    }

} // close class


var Application = function(){
    var self = this;

    self.Initialize = function(){

        self.ip = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
        self.port = process.env.PORT || 8081;


        var app = express();

        // use local port
        //self.server.listen(process.env.PORT || 8081);

        //Setup rotuing for app
        app.use(express.static(__dirname + '/public'));
        //self.server.listen(process.env.PORT || 8081);
        self.server = http.Server(app);

        startTwitterStreamService();
    };

    var startTwitterStreamService = function(){
        var twitterStreamService = new TwitterStreamService(self.server);
        twitterStreamService.StartService();
    };

    self.Start = function(){
      self.server.listen(process.env.PORT || 8081, function() {
        console.log(new Date() + ' - Server started. Listening on ' + self.ip + ':' + self.port);

      });
    };
}

var app = new Application();
app.Initialize();
app.Start();
