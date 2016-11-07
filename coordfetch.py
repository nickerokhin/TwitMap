from tweepy import Stream
from tweepy import OAuthHandler
from tweepy.streaming import StreamListener
import json


consumer_key = ""
consumer_secret = ""
access_key = ""
access_secret = ""

class listener(StreamListener):
    def on_data(self,data):
         jd = json.loads(data)
         if('geo' in jd and 'coordinates' in jd and 'place' in jd):
             if(jd['geo'] != None):
                 print("Coords:",jd['geo']['coordinates'])
             elif(jd['coordinates'] != None):
                 print("Coords:",jd['coordinates']['coordinates'])
             elif(jd['place'] != None):
                 print("Coords:",jd['place']['bounding_box']['coordinates'][0][1])
         return True

    def on_error(self, status):
        print(status)

auth = OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_key, access_secret)
twitterStream = Stream(auth, listener())
twitterStream.filter(track=["trump"])
