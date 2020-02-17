import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback} from 'react-native';

import Colors from '../constants/Colors';

export default class ProductCard extends Component {
  constructor(props) {
    super(props);
  }

  getProductPhoto(id) {
    return `https://firebasestorage.googleapis.com/v0/b/prceliaco-1cfac.appspot.com/o/products%2F${id}.png?alt=media`
  }

  selectProduct(product) {
    this.props.showOrHideProductByStores(product);
  }

  render() {
    const product = this.props.product.item;
    
    return (
      <TouchableWithoutFeedback onPress={() => this.selectProduct(product)}>
        <View style={styles.card}>
          <Image style={styles.photo} source={{uri: this.getProductPhoto(product.id)}} />
          <View style={styles.product}>
            <Text style={styles.name}> {product.name}</Text>
            <Text style={styles.brand}>
              <Text style={styles.boldText}>Marca: </Text>{product.brand}
            </Text>
            <Text style={styles.description}>
              <Text style={styles.boldText}>Cantidad: </Text>{product.quantity}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 0.2,
    flexDirection: 'row',
    marginTop: 10,
    marginHorizontal: 10,
    minWidth: '90%',
    borderRadius: 5,
    backgroundColor: Colors.secondaryDarkColor,
  },
  photo: {
    borderRadius: 5,
    width: 50,
    height: 'auto',
    flex: 0.3,
  },
  product: {
    flex: 0.7,
    paddingVertical: 10,
    paddingLeft: 15,
  },
  name: {
    fontSize: 16,
    textTransform: 'capitalize',
    textAlign: 'center'
  },
  boldText: {
    fontWeight: 'bold'
  }
});
