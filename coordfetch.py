from tweepy import Stream
from tweepy import OAuthHandler
from tweepy.streaming import StreamListener
import json
import pprint

consumer_key = "JrnWTAY3je7llr39xKIoM56mT"
consumer_secret = "FVHWRrgSi5EuyrRFZZKwzScAP4mqLRatcZuxtcaLL4zq6cwVSZ"
access_key = "159238058-FGetuUbim8pIc7NAfvHNxxlqyhADpaUIyLUrT5Aj"
access_secret = "13Qgxn9aTha8U7IF78F14Y1ZKDO6KneKKc40rsDGDnTrJ"

class listener(StreamListener):
    def on_data(self,data):
         jd = json.loads(data)
         if('geo' in jd and 'coordinates' in jd and 'place' in jd):
             if(jd['geo'] != None):
                 print(jd['text'],"Coords:",jd['geo']['coordinates'])
             elif(jd['coordinates'] != None):
                 print(jd['text'],"Coords:",jd['coordinates']['coordinates'])
             elif(jd['place'] != None):
                 print(jd['text'],"Coords:",jd['place']['bounding_box']['coordinates'][0][1])
         return True

    def on_error(self, status):
        print(status)

auth = OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_key, access_secret)
twitterStream = Stream(auth, listener())
twitterStream.filter(track=["@realDonaldTrump"])
