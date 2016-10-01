import sys
non_bmp_map = dict.fromkeys(range(0x10000, sys.maxunicode + 1), 0xfffd) #Stream crashes when it sees emojis, this replaces emojis with inoffensive characters
from TwitterSearch import *
tso = TwitterSearchOrder() #searchorder object
tso.set_keywords(['Hillary', 'Trump']) #keyword search
tso.set_language('en') #Set language to english
tso.set_include_entities(False) # probably JSON stuff

    #My personal API access tokens
ts = TwitterSearch(
        consumer_key = 'J6QlDpfMCWuX4zgyfnvt8RUy5',
        consumer_secret = 'cWTHpaRHa1mHPMXnwL6I60DVAzfjmAti2l1fZtwYLYjrSnkuyZ',
        access_token = '159238058-6Vzd3ZJlrul5kusfYPALJcfz1GDypSh5edLvhyPZ',
        access_token_secret = 'GZhcOeZYgT3zHJObkwtWy3JKkEOVgAVrP2N8Md2syBPoc'
     )

for tweet in ts.search_tweets_iterable(tso):
    print('@', tweet['user']['screen_name'], 'tweeted:', tweet['text'].translate(non_bmp_map) )
