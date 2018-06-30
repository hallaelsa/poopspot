import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button } from 'react-native';
import MapView from 'react-native-maps';
import { Permissions, Location } from 'expo';

// next: try to cluster poops together so I can show one big one instead of many small ones..

export default class Map extends React.Component {
  state = {
    mapRegion: { latitude: 59.925453, longitude: 10.752839, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
    locationResult: null,
    currentLocation: { coords: { latitude: 59.925453, longitude: 10.752839 } },
    changingLocation: '',
    markers: [{
      title: 'poops',
      coordinates: {
        latitude: 59.925453,
        longitude: 10.752839
      },
      image: require('../img/poopXS.png'),
      count: 1,
    }],
    onPressLocation: '',
  };

  componentDidMount() {
    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        locationResult: 'Permission to access location was denied'
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ locationResult: JSON.stringify(location), currentLocation: location });
    this.setState({ mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0102, longitudeDelta: 0.0046 } });

  };

  _onLongPress(data) {
    const coordinate = data.nativeEvent.coordinate;
    //data.nativeEvent.coordinate.latitude
    this.setState({ onPressLocation: { coords: { latitude: coordinate.latitude, longitude: coordinate.longitude } } });

  }

  _clearMarker() {
    this.setState({ onPressLocation: { coords: null } });
  }

  _onRegionChangeComplete(region) {
    this.setState({ mapRegion: region })
  }

  _addPoop(location) {
    const timeStamp = new Date();
    const markers = this.state.markers;
    const marker = {
      title: timeStamp.toString(), coordinates: {
        latitude: location.nativeEvent.coordinate.latitude,
        longitude: location.nativeEvent.coordinate.longitude
      }
    };
    markers.push(marker)
    this.setState({ markers: markers });
  }

  _addPoop() {
    const timeStamp = new Date();
    const markers = this.state.markers;
    let longitude = ''
    let latitude = ''
    let image = require('../img/poopXS.png')
    let counter = 1;

    if (this.state.onPressLocation) {
      latitude = this.state.onPressLocation.coords.latitude,
        longitude = this.state.onPressLocation.coords.longitude
    } else {
      latitude = this.state.currentLocation.coords.latitude,
        longitude = this.state.currentLocation.coords.longitude
    }

    markers.forEach(function (mark, index, object) {
      if (Number((latitude).toFixed(5)) == Number((mark.coordinates.latitude).toFixed(5))) {
        counter += mark.count;
        object.splice(index, 1);

        if (counter > 10) {
          image = require('../img/poopGolden.png');
        } else if (counter > 6) {
          image = require('../img/poopBshiny.png');
        } else if (counter > 2) {
          image = require('../img/poopBsmall.png');
        } else {
          image = require('../img/poopBm.png');
        }
      }
    }, this);

    const title = counter + " times. Last date: " + timeStamp;
    const marker = {
      title: title, coordinates: {
        latitude: latitude,
        longitude: longitude
      }, image: image, count: counter
    };

    markers.push(marker)
    this.setState({ markers: markers });
  }

  render() {
    const markerIcon = require('../img/poopXS.png')
    const coords = this.state.currentLocation.coords;
    const mapRegion = this.state.mapRegion;
    
    return (
      <View style={styles.container}>
        {
          this.state.locationResult ?

            <MapView
              style={styles.map}
              initialRegion={this.state.mapRegion}
              region={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude, latitudeDelta: mapRegion.latitudeDelta, longitudeDelta: mapRegion.longitudeDelta }}
              // { latitude: mapRegion.latitude, longitude: mapRegion.longitude, latitudeDelta: mapRegion.latitudeDelta, longitudeDelta: mapRegion.longitudeDelta }
              onLongPress={(data) => this._onLongPress(data)}
              onPress={() => this._clearMarker()}
              onRegionChangeComplete={(region) => this._onRegionChangeComplete(region)}
            >

              {this.state.onPressLocation.coords ?
                <MapView.Marker
                  coordinate={this.state.onPressLocation.coords}
                  title={"Pooped here?"}
                  description={"Add poops!"}
                  pinColor="blue"
                  onCalloutPress={() => this._addPoop()}
                /> :
                <MapView.Marker
                  coordinate={this.state.currentLocation.coords}
                  title="Current location"
                  description="Add poops?"
                  onCalloutPress={() => this._addPoop()}
                />
              }

              {this.state.markers ? this.state.markers.map(marker => (
                <MapView.Marker
                  key={marker.title}
                  coordinate={marker.coordinates}
                  title={marker.title}
                  image={marker.image}
                />
              )) : null}

            </MapView>
            :
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" style={styles.activityIndicator} />
            </View>

        }

        <Button onPress={() => this._addPoop()} title="Add poops!" style={styles.btn} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  activityIndicator: {
    color: 'blue',
    alignSelf: 'center'
  },
  btn: {
    position: 'absolute',
    padding: 16,
    marginBottom: 100,
  },
});