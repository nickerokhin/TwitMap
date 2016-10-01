import sys
non_bmp_map = dict.fromkeys(range(0x10000, sys.maxunicode + 1), 0xfffd) #Stream crashes when it sees emojis, this replaces emojis with inoffensive characters
from TwitterSearch import *
tso = TwitterSearchOrder() #searchorder object
tso.set_keywords(['Hillary', 'Trump']) #keyword search
tso.set_language('en') #Set language to english
tso.set_include_entities(False) # probably JSON stuff

    #My personal API access tokens
ts = TwitterSearch(
        consumer_key = '',
        consumer_secret = '',
        access_token = '',
        access_token_secret = ''
     )

for tweet in ts.search_tweets_iterable(tso):
    print('@', tweet['user']['screen_name'], 'tweeted:', tweet['text'].translate(non_bmp_map) )
