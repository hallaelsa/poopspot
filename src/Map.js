import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button, AsyncStorage } from 'react-native';
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
      image: 'small',
      count: 1,
    }],
    onPressLocation: '',
  };

  componentDidMount() {
    this._getLocationAsync();
  }

  async componentWillMount() {
    this._retrieveData();
  }

  _removeData = async () => {
    try {
      await AsyncStorage.removeItem('markers');
      this.setState({ markers: null })
    } catch (error) {
      console.log(error);
    }
  }

  _storeData = async (markers) => {
    try {
      await AsyncStorage.setItem('markers', JSON.stringify(markers));
    } catch (error) {
      console.log(error);
    }
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('markers');
      if (value !== null) {
        let marks = JSON.parse(value)
        //alert(marks[1].image)
        this.setState({ markers: marks });
      }
    } catch (error) {
      console.log(error)
    }
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

  _getImage(image) {
    switch (image) {
      case 'golden': {
        return require("../img/poopGolden.png");
      }
      case 'shiny': {
        return require("../img/poopBshiny.png");
      }
      case 'big': {
        return require("../img/poopBsmall.png");
      }
      case 'small': {
        return require("../img/poopBm.png");
      }
      default: {
        return require("../img/poopXS.png");
      }
    }
  }

  _addPoop() {
    const timeStamp = new Date();
    let markers = []

    if (this.state.markers)
      markers = this.state.markers;

    let longitude = ''
    let latitude = ''
    let image = 'xsmall';
    let counter = 1;

    if (this.state.onPressLocation.coords) {
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
          image = 'golden';
        } else if (counter > 6) {
          image = 'shiny';
        } else if (counter > 2) {
          image = 'big';
        } else {
          image = 'small';
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

    this._storeData(markers);
    this.setState({ markers: markers });
  }

  render() {
    const mapRegion = this.state.mapRegion;
    return (
      <View style={styles.container}>
        {
          this.state.locationResult ?

            <MapView
              style={styles.map}
              initialRegion={this.state.mapRegion}
              region={{ latitude: mapRegion.latitude, longitude: mapRegion.longitude, latitudeDelta: mapRegion.latitudeDelta, longitudeDelta: mapRegion.longitudeDelta }}
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

              {this.state.markers ? this.state.markers.map((marker) => {
                const img = this._getImage(marker.image);

                return (
                  <MapView.Marker
                    key={marker.title}
                    coordinate={marker.coordinates}
                    title={marker.title}
                    image={img}
                  />
                )
              }
              ) : null}

            </MapView>
            :
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" style={styles.activityIndicator} />
            </View>

        }
        <View style={styles.btnContainer}>
          <Button onPress={() => this._addPoop()} title="Add poops!" />
          <View style={{width: 20}}></View>
          <Button onPress={() => this._removeData()} title="Delete all!" color="red" />
        </View>
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
    alignSelf: 'center'
  },
  btnContainer: {
    flexDirection: 'row',
  },
});