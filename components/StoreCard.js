import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { firebaseApp } from "../config/firebase";

import Colors from '../constants/Colors';


export default class StoreCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      store: {},
    }

    this.storesRef = firebaseApp.database().ref().child("stores");
  }

  componentWillMount() {
    if(!this.props.store) {this.listenForStores(this.storesRef);} 
  }

  listenForStores(storesRef) {
    const productByStores = this.props.productByStores.item;

    storesRef.on("value", snap => {
      let stores = [];
      snap.forEach(child => {
        stores.push({
          id: child.val().id,
          address: child.val().address,
          name: child.val().name,
          distance: child.val().distance,
          location: {
            latitude: child.val().location.latitude,
            longitude: child.val().location.longitude
          },
          openedTime: child.val().openedTime,
          _key: child.key
        });
      });

      const store = stores.find(item => item.id === productByStores.store)

      this.setState({
        stores: stores,
        store: store,
      });
    });
  }

  getStorePhoto(store) {
    return `https://firebasestorage.googleapis.com/v0/b/prceliaco-1cfac.appspot.com/o/stores%2F${store}.png?alt=media`;;
  }

  formatToKM(distance) {
    return distance >= 1000 ? (distance * 0.001).toFixed(3).slice(0,-1) : distance;
  }

  formatUnit(distance) {
    return distance >= 1000 ? 'km' : 'm'
  }

  render() {
    const { orderedStores } = this.props;
    const productByStores = this.props.store ? [] : this.props.productByStores.item;
    const store = this.props.store ? this.props.store : orderedStores.find(store => store.id === productByStores.store)
    const formatedDistance = this.props.store ? this.formatToKM(store.item.distance) : this.formatToKM(store.distance);
    const unit = this.props.store ? this.formatUnit(store.item.distance) : this.formatUnit(store.distance);
    
    return (
      this.props.store ?
      
      <View style={styles.card}>
        <Image style={styles.photo} source={{uri: this.getStorePhoto(store.item.id)}} />
        <View style={styles.store}>
          <Text style={styles.name}> {store.item.name} </Text>
          <Text style={styles.address}>
            <Text style={styles.boldText}>Distancia:</Text> {formatedDistance} {unit}
          </Text>
          <Text style={styles.address}>
            <Text style={styles.boldText}>Dirección:</Text> {store.item.address}
          </Text>
          <Text style={styles.address}>
            <Text style={styles.boldText}>Horario de atencion:</Text> {store.item.openedTime}
          </Text>
        </View>
      </View>

      :

      <View style={styles.card}>
        <Image style={styles.photo} source={{uri: this.getStorePhoto(productByStores.store)}} />
        <View style={styles.store}>
          <Text style={styles.name}> {store.name} </Text>
          <Text style={styles.address}>
            <Text style={styles.boldText}>Distancia:</Text> {formatedDistance} {unit}
          </Text>
          <Text style={styles.address}>
            <Text style={styles.boldText}>Dirección:</Text> {store.address}
          </Text>
          <Text style={styles.address}>
            <Text style={styles.boldText}>Precio en este local:</Text> ${ productByStores.price }
          </Text>
          <Text style={styles.address}>
            <Text style={styles.boldText}>Horario de atencion:</Text> {store.openedTime}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 0.2,
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryDarkColor,
  },
  photo: {
    borderRadius: 5,
    width: 50,
    height: 'auto',
    flex: 0.3,
  },
  store: {
    flex: 0.7,
    padding: 5,
  },
  name: {
    fontSize: 20,
    textAlign: 'center'
  },
  boldText: {
    fontWeight: 'bold'
  }
});
