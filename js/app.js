


let map;
let infoWindow
let bounds;

// TODO: Complete the following function to initialize the map
function initMap() {
  // Constructor creates a new map - only center and zoom are required
  let woodstock = {
    lat: 34.101331,
    lng: -84.519381
  };
  map = new google.maps.Map(document.getElementById('map'), {
    center: woodstock,
    zoom: 17
  });


 infoWindow = new google.maps.InfoWindow();
 bounds = new google.maps.LatLngBounds();
 ko.applyBindings(new ViewModel());
}

//handle map error if unable to Load
function googleMapsError() {
  alert('There was an error whil loading the map. Please try refreshing the page.')
}

let foreSquareAlert = false;

//connecting markers
let LocationMarker = function (info) {
  let self = this;

  this.title = info.title;
  this.position = info.location;
  this.street = '';
  this.city = '';

  this.visible = ko.observable(true);

  // Standard marker color as red
let defaultIcon = makeMarkerIcon('f44141');

// On hover change color to blue
let highlightedIcon = makeMarkerIcon('4286f4');

  //foursquare credentials

  let clientID = 'ENVNNTTOSKWJSI32U4YJQKXNXOMM0UTWSPESSMONEWT233PP';
  let clientSecret = 'KOR1G3JW4G42QRPOVLXXE53BHKXDMLAKZOJZGBSVJUYQV43F';

  //request for foursquare api
  let foresquareSearchURL ='https://api.foursquare.com/v2/venues/search?ll=' + this.position.lat + ',' + this.position.lng + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20180522' + '&query=' + this.title;

  //JSON request from foursquare
  $.getJSON(foresquareSearchURL).done(function (result) {
    if (result.response.venues.length > 0 ) {
      let results = result.response.venues[0];
      self.street = results.location.formattedAddress[0] ? results.location.formattedAddress[0] : 'N/A';
      self.city = results.location.formattedAddress[1] ? results.location.formattedAddress[1] : 'N/A';
    } else {
      alert('Could not find entry for ' + info.title);
      console.log(foresquareSearchURL);
    }
  }).fail(function(error) {

    console.log(foresquareSearchURL);
    console.log(error);
    if(foreSquareAlert != error.responseJSON.meta.errorDetail) {
      alert('Failed to get additional information from Foresquare: ' + error.responseJSON.meta.errorDetail);
    }
    foreSquareAlert = error.responseJSON.meta.errorDetail;
  });

  //marker location and list info (markers.js)
  this.marker = new google.maps.Marker({
    position: this.position,
    title: this.title,
    animation: google.maps.Animation.DROP,
    icon: defaultIcon
  });

  //marker filter
  self.filterMarkers = ko.computed(function () {

    //show only chosen filterMarkers
    if (self.visible() === true) {
      self.marker.setMap(map);
      bounds.extend(self.marker.position);
      map.fitBounds(bounds);
    } else {
      self.marker.setMap(null);
    }
  });

  //InfoWindow appears on onclick
  this.marker.addListener('click', function () {
    populateInfoWindow(this, self.street, self.city, infoWindow);
    toggleBounce(this);
    map.panTo(this.getPosition());
  });

  //highlight marker on mouse over
  this.marker.addListener('mouseover', function () {
    this.setIcon(highlightedIcon);
  });

  //revert marker icon when cursor leaves
  this.marker.addListener('mouseout', function () {
    this.setIcon(defaultIcon);
  });


  //show location info on onclick
  this.show = function (location) {
    google.maps.event.trigger(self.marker, 'click');
  };

  //add bounce animation to marker on onclick
  this.bounce = function (place) {
    google.maps.event.trigger(self.marker, 'click');
  };

};

/*View Model */
let ViewModel = function () {
  let self = this;

  this.searchItem = ko.observable('');

  this.mapList = ko.observableArray([]);

  //for each marker, adds html code info index.html per markers
  markers.forEach(function (location) {
    self.mapList.push(new LocationMarker(location));
  });

  //show selected marker dependent on search query
  this.locationList = ko.computed(function () {
    let searchFilter = self.searchItem().toLowerCase();
    if (searchFilter) {
      return ko.utils.arrayFilter(self.mapList(), function (location) {
        let current = location.title.toLowerCase();
        let result = current.includes(searchFilter);
        location.visible(result);
        return result;
      });
    }
    self.mapList().forEach(function (location) {
      location.visible(true);
    });
    return self.mapList();
  }, self);
};

//populate info windo with info
function populateInfoWindow(marker, street, city, infowindow) {
  if (infowindow.marker != marker) {

    //clear infoWindow content to show street view of markers
    infowindow.setContent('');
    infowindow.marker = marker;

    //marker is removed when infoWindow is closed
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
    let streetViewService = new google.maps.StreetViewService();
    let radius = 30;

    //HTML & CSS for infoWindow
    let infoWindowContent = '<h4>' + marker.title + '</h4>' + '<p>' + street + "<br>" + city + '<br>' + "</p>";

    //load street view
    let getStreetView = function (info, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        let StreetViewLocationRequest = info.location.latLng;
        let heading = google.maps.geometry.spherical.computeHeading(
          StreetViewLocationRequest, marker.position);

        infowindow.setContent(infoWindowContent + '<div id="pano"></div>');
        let panoramaOptions = {
          position: StreetViewLocationRequest,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        let panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent(infoWindowContent + '<div style="color: red">No Street View Found.</div>');
      }
    };

    //use street viw to show closest street view options
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    infowindow.open(map, marker);
  }
}

//toggle bounce Animation
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
      marker.setAnimation(null);
    }, 1400);
  }
}

//marker shape
function makeMarkerIcon(markerColor) {
  let markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21, 34));
  return markerImage;
  }
