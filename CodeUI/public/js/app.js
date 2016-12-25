//This file is not being used in our app, it was merely being used to test a few things in our app. 
//Credit to https://github.com/wlngwang/real-time-tweets-sentiment-map


var module = angular.module('app', []);

module.factory('socket', function($rootScope){
    var socket = io.connect(window.location.href);
  	return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
            	var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
	      	socket.emit(eventName, data, function () {
	        	$rootScope.$apply(function () {
	          		if (callback) {
	            		callback.apply(socket, data);
	          		}
	        	});
	      	})
	    }
    };
});

module.factory('GoogleMap', function(){
    
    //var myLatlng = new google.maps.LatLng(39,-98);
    var light_grey_style = [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}];

    var mapOptions = {
		center: {lat: 42, lng: -95},
		zoom: 4,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
	    
	}
	return new google.maps.Map($('#map-canvas')[0], mapOptions);
});

module.controller('MapController', function($scope, GoogleMap, socket){
	var keyword = null;
	var markers = [];
	$scope.showLimitMessage = false;
	$scope.keyword = null;
	$scope.stopBtnValue = 'Stop';
	//$scope.trends = [];

	$scope.RestartBtnClick = function(){
		
		for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        heatmap.setMap(null)
        heatmap = new google.maps.visualization.HeatmapLayer({
			data: liveTweets,
			radius: 25
		});
		heatmap.setMap(GoogleMap);

        markers.length = 0;
        markers = [];
		keyword = $scope.keyword.trim();
	}

	$scope.StopBtnClick = function(){
		if($scope.stopBtnValue === 'Stop')
			$scope.stopBtnValue = 'Continue';
		else
			$scope.stopBtnValue = 'Stop';
	}

	socket.on('connected', function(){
		socket.emit('start tweets');
	});

	var heatmap;
	var liveTweets = new google.maps.MVCArray();
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: liveTweets,
		radius: 25
	});
	heatmap.setMap(GoogleMap);

	socket.on('new-tweet', function(tweet){
		$scope.showLimitMessage = false;
		if($scope.stopBtnValue === 'Stop' &&
			(!keyword || keyword.length === 0 
				|| tweet.text.toLowerCase().indexOf(keyword.toLowerCase()) > -1))
		{
			
	      var tweetLocation = new google.maps.LatLng(tweet.coordinates.coordinates[1], tweet.coordinates.coordinates[0]);
	      liveTweets.push(tweetLocation);
/*
	      var image = null;
			if(tweet.sentiment.score < 0)
				image = '../css/marker-red.png';
			if(tweet.sentiment.score == 0)
				image = '../css/marker-yellow.png';
			if(tweet.sentiment.score > 0)
				image = '../css/marker-green.png';
			else
				image = '../css/marker-green.png';

	      //Flash a dot onto the map quickly
	      //var image = "css/small-dot-icon.png";
	      var marker = new google.maps.Marker({
	        position: tweetLocation,
	        map: GoogleMap,
	        icon: image
	      });
*/	     

      	}
	});

	socket.on('stream-limit', function(){
		$scope.showLimitMessage = true;
	});
});
