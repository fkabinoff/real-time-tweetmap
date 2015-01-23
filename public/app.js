var maxBounds =  L.latLngBounds(
    L.latLng(24.31, -124.46),
    L.latLng(49.23, -66.57)
);

var map = L.map('map', {
    'center': [39.82, -98.58],
    'zoom': 5,
    'maxBounds': maxBounds,
    'minZoom': 5
}).fitBounds(maxBounds);

L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18
}).addTo(map);

var _socket = null;
var count = 0;
$(function() {
    if(io !== undefined) {
        _socket = io.connect();
        _socket.on("new tweet", function(tweet) {
            if(tweet.coordinates && tweet.place.country_code=="US"){
                count += 1;
                $("#count").html(count);
                var r = map.getZoom() - 4;
                var marker = L.circleMarker([tweet.geo.coordinates[0], tweet.geo.coordinates[1]], {
                    radius: r,
                    color: '#4099FF',
                    fillColor: '#4099FF',
                    fillOpacity: 1
                });
                map.on('zoomend', function() {
                  var currentZoom = map.getZoom();
                  marker.setRadius(currentZoom - 4);
                });
                marker.bindPopup("<img class='profile-image' height='50' src=" + tweet.user.profile_image_url + "><div class='tweet-wrapper'><span class='tweet-username'>" + tweet.user.name + "</span> @" + tweet.user.screen_name + "<div class='tweet-text'>" + tweet.text + "</div></div>");
                map.addLayer(marker);
            }
        });

        _socket.on("connected", function(r) {
            emitMsj("start stream");
        });
    }
});
function emitMsj(signal, o) {
    if(_socket) {
        _socket.emit(signal, o);
    }
    else {
        console.log("Socket.io did not start");
    }
}