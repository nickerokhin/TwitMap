#!/usr/local/bin/python3

from tweepy import Stream
from tweepy import OAuthHandler
from tweepy.streaming import StreamListener
import json
import urllib.request
import urllib.parse
import sys
from socketIO_client import SocketIO, LoggingNamespace


arguments = sys.argv
del arguments[0]
track = arguments
#print(track)
#track = ["dallas cowboys", "cowboys football", "tony romo", "#dallascowboys", "#cowboys", "cowboys", "Ezekiel Elliot"]
#print(track)
#track = ["@realDonaldTrump"]
consumer_key = "JrnWTAY3je7llr39xKIoM56mT"
consumer_secret = "FVHWRrgSi5EuyrRFZZKwzScAP4mqLRatcZuxtcaLL4zq6cwVSZ"
access_key = "159238058-FGetuUbim8pIc7NAfvHNxxlqyhADpaUIyLUrT5Aj"
access_secret = "13Qgxn9aTha8U7IF78F14Y1ZKDO6KneKKc40rsDGDnTrJ"
sentiment_load = 0
sentiment_index = 0
total_sentiment = 0
class listener(StreamListener):


    def on_data(self,data):
         coords = ""
         jd = json.loads(data)
         if 'text' in jd: #Taking sentiment from all tweets matching keywords
             text = jd['text'] #urllib.parse doesnt like json, storing tweet text in var as string
             values = {'txt': text} #API request parameters
             parsed_values = urllib.parse.urlencode(values) #URL encoding request
             bytes_data = parsed_values.encode('ascii') #Parsing data for post request
             sentiment = urllib.request.urlopen("http://sentiment.vivekn.com/api/text/", bytes_data) #POST request to sentiment analysis API
             json_sentiment = json.loads(sentiment.read().decode('utf-8')) #getting rid of noise in json
             confidence = json_sentiment["result"]["confidence"]
             sent = json_sentiment["result"]["sentiment"]
             if float(confidence) > 75:
                 global sentiment_load
                 sentiment_load += 1
                 count = 0
                 if sent == 'Negative':
                     count = -1
                 if sent == 'Positive':
                     count = 1
                 global sentiment_index
                 sentiment_index += count
                 if sentiment_load != 0 and sentiment_load % 30 == 0:
                     #Percentage positive/negative in last 5 minutes
                     #Jordan Boyd
                     #ElRE
                     #Janice
                     #Project epic
                     print("Temp sentiment:", (sentiment_index/sentiment_load))
                     global total_sentiment
                     total_sentiment += (sentiment_index/sentiment_load)
                     print("Total sentiment:", total_sentiment)
                     sentiment_load = 0
                     sentiment_index = 0
                 #if sentiment_load != 0 and sentiment_load % 30 == 0:
                     #print(sentiment_index/sentiment_load)
             if('geo' in jd and 'coordinates' in jd and 'place' in jd): #if coordinate fields exist
                 if(jd['geo'] != None):
                     coords = jd['geo']['coordinates']
                 elif(jd['coordinates'] != None):
                     coords = jd['coordinates']['coordinates']
                 elif(jd['place'] != None): #most relevant coordinates first
                     coords = jd['place']['bounding_box']['coordinates'][0][1]
                 if coords != "": #if coords variable is not, empty, begin Sentiment analysis
                     lat = coords[0]
                     lon = coords[1]
                     with SocketIO('localhost', 8081) as socketIO:
                         socketIO.emit({'lat': lat, 'long': lon})
             return




    def on_error(self, status):
        print(status)


auth = OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_key, access_secret)
twitterStream = Stream(auth, listener())
twitterStream.filter(track=track)
