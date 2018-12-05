// TODO: Create a map variable
var map;

var markers = [];
// TODO: Complete the following function to initialize the map
function initMap() {
  // Constructor creates a new map - only center and zoom are required
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 34.101331, lng: -84.519381},
    zoom: 17
  });
  var locations = [
    {title: 'Bob the Turkey', location: {lat: 34.099842, lng: -84.519943}},
    {title: 'Pie Bar', location: {lat: 34.099400, lng: -84.520342}},
    {title: 'Copper Coin', location: {lat: 34.099661, lng: -84.518967}},
    {title: 'Elm Street Arts Theater', location: {lat: 34.101792, lng: -84.519891}},
    {title: 'Woodstock Events Green', location: {lat: 34.100189, lng: -84.521686}},
  ];

  var largeInfowindo = new google.maps.InfoWindow();

  // The following group uses the location array to create an array of markers on initialize
  for (var i = 0; i < locations.length; i++) {
    //Get position from the location array
    var position = locations[i].location;
    var title = locations[i].title;
    //Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    //Push the marker to our array of markers
    markers.push(marker);
    //Create an onclick event to open an infowindow at each marker
    marker.addListener('click', function(){
      populateInfoWindow(this, largeInfowindo);
    });
  }

  //this enables the Show Sites button to display the markers
  function showSites() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  function hideSites() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }



  document.getElementById('show-sites').addEventListener('click', showSites);
  document.getElementById('hide-sites').addEventListener('click', hideSites);


/*  var bob_the_turkey ={lat: 34.099842, lng:  -84.519943}
  var marker = new google.maps.Marker({
    position: bob_the_turkey,
    map: map,
    title: 'First Marker!'
  });
  var infowindow = new google.maps.InfoWindow({
    content: 'Do you ever feel like an InfoWindow, floating through the wind,' + ' ready to start again?'
  });
  marker.addListener('click', function(){
    infowindow.open(map, marker);
  }); */
};
