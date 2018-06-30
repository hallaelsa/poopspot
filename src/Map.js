import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { Permissions, Location } from 'expo';

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
    },
    {
      title: 'poops2',
      coordinates: {
        latitude: 59.947459,
        longitude: 10.624138
      },
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
    this.setState({ mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }});
    
  };

  _onLongPress(data) {
    const coordinate = data.nativeEvent.coordinate;
    //data.nativeEvent.coordinate.latitude
    this.setState({ onPressLocation: {coords: {latitude: coordinate.latitude, longitude: coordinate.longitude} }});

  }

  _clearMarker() {
    this.setState({ onPressLocation: {coords: null }});
  }

  _onRegionChangeComplete(region){
    this.setState({mapRegion: region})
  }

  render() {
    const markerIcon = require('../img/poopBsmall.png')
    const coords = this.state.currentLocation.coords;
    const mapRegion = this.state.mapRegion;
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={ this.state.mapRegion}
          region={ { latitude: mapRegion.latitude, longitude: mapRegion.longitude, latitudeDelta: mapRegion.latitudeDelta, longitudeDelta: mapRegion.longitudeDelta } }
          // { latitude: mapRegion.latitude, longitude: mapRegion.longitude, latitudeDelta: mapRegion.latitudeDelta, longitudeDelta: mapRegion.longitudeDelta }
          onLongPress={(data) => this._onLongPress(data)}
          onPress={() => this._clearMarker()}
          onRegionChangeComplete={(region) => this._onRegionChangeComplete(region)}
        >
          
          {this.state.onPressLocation.coords ?
          <MapView.Marker
            coordinate={this.state.onPressLocation.coords}
            title="Pooped here?"
            description="Add poops!"
            pinColor="blue"
          /> : 
          <MapView.Marker
            coordinate={this.state.currentLocation.coords}
            title="Current location"
            description="Add poops?"
          />
        }

          {this.state.markers? this.state.markers.map(marker => (
            <MapView.Marker
              key={marker.title}
              coordinate={marker.coordinates}
              title={marker.title}
              image={markerIcon}
            />
          )) : null}

        </MapView>
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
  map: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  }
});