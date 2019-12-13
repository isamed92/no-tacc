import React, { Component } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

import { firebaseApp } from "../config/firebase";

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
    this.listenForStores(this.storesRef);
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
    return `https://firebasestorage.googleapis.com/v0/b/prceliaco-1cfac.appspot.com/o/stores%2F${store}.png?alt=media`;
  }

  render() {
    const { store } = this.state;
    const productByStores = this.props.productByStores.item;
    
    return (
      <View style={styles.card}>
        <Image style={styles.photo} source={{uri: this.getStorePhoto(productByStores.store)}} />
        <View style={styles.store}>
          <Text style={styles.name}> {store.name} </Text>
          <Text style={styles.address}>
            Dirección: {store.address}
          </Text>
          <Text style={styles.address}>
            Precio: ${ productByStores.price }
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
    paddingTop: 10,
    paddingHorizontal: 10,
    height: 120
  },
  photo: {
    width: 50,
    height: 'auto',
    flex: 0.3,
    backgroundColor: 'powderblue'
  },
  store: {
    flex: 0.7,
    padding: 5,
    backgroundColor: 'skyblue'
  },
  name: {
    fontSize: 20,
    textAlign: 'center'
  }
});