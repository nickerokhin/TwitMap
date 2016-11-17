from tweepy import Stream
from tweepy import OAuthHandler
from tweepy.streaming import StreamListener
import json
import urllib.request
import urllib.parse


consumer_key = "JrnWTAY3je7llr39xKIoM56mT"
consumer_secret = "FVHWRrgSi5EuyrRFZZKwzScAP4mqLRatcZuxtcaLL4zq6cwVSZ"
access_key = "159238058-FGetuUbim8pIc7NAfvHNxxlqyhADpaUIyLUrT5Aj"
access_secret = "13Qgxn9aTha8U7IF78F14Y1ZKDO6KneKKc40rsDGDnTrJ"

class listener(StreamListener):
    def on_data(self,data):
         coords = ""
         jd = json.loads(data)
         if('geo' in jd and 'coordinates' in jd and 'place' in jd): #if coordinate fields exist
             if(jd['geo'] != None):
                 coords = jd['geo']['coordinates']
             elif(jd['coordinates'] != None):
                 coords = jd['coordinates']['coordinates']
             elif(jd['place'] != None): #most relevant coordinates first
                 coords = jd['place']['bounding_box']['coordinates'][0][1]
             if coords != "": #if coords variable is not, empty, begin Sentiment analysis

                 coordinates = coords
                 text = jd['text'] #urllib.parse doesnt like json, storing tweet text in var as string
                 values = {'txt': text} #API request parameters
                 parsed_values = urllib.parse.urlencode(values) #URL encoding request
                 bytes_data = parsed_values.encode('ascii') #Parsing data for post request
                 sentiment = urllib.request.urlopen("http://sentiment.vivekn.com/api/text/", bytes_data) #POST request to sentiment analysis API
                 json_sentiment = json.loads(sentiment.read().decode('utf-8')) #getting rid of noise in json
                 confidence = json_sentiment["result"]["confidence"]
                 sent = json_sentiment["result"]["sentiment"]
                 print(text, "\n", "Coords:", coordinates, "\n", "Sentiment:", sent, "\n", "Confidence:", confidence, "\n")
                 return True

    def on_error(self, status):
        print(status)

auth = OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_key, access_secret)
twitterStream = Stream(auth, listener())
twitterStream.filter(track=["trump"])
