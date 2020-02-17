import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity
} from 'react-native';
import colors from '../constants/Colors';
import ProductCard from './ProductCard';
import { Spinner, Icon } from 'native-base';
import Colors from '../constants/Colors';
import FilterProduct from '../components/FilterProduct';

const origin = ['Elaboración Propia', 'Envasados'];

export default class ProductSearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: this.props.products,
      filtersActive: false,
      origin: -1
    };
    this.allProducts = this.props.products;
    this.filterOrigin = this.filterOrigin.bind(this);
  }
  renderButton() {
    return (
      <TouchableOpacity
        style={styles.userButton}
        onPress={() => this.pressfilter()}
      >
        <Icon name='grid' />
      </TouchableOpacity>
    );
  }

  pressfilter() {
    this.setState({ filtersActive: !this.state.filtersActive });
    if (!this.state.filtersActive) this.setState({ origin: -1 });
  }

  filterOrigin(itemOrigin) {
    let newData = [];
    if (itemOrigin === -1) newData = this.allProducts;
    else newData = this.allProducts.filter(item => item.origin === itemOrigin);

    this.setState({ products: newData });
  }

  setFoundProductsText() {
    const number = this.state.products.length;
    const text =
      this.state.products.length === 1
        ? 'producto encontrado'
        : 'productos encontrados';

    return `${number} ${text}`;
  }

  render() {
    const { showOrHideProductByStores } = this.props;
    const foundProductsText = this.setFoundProductsText();

    return !this.state.products ? (
      <View style={styles.loading}>
        <Text style={styles.title}> Cargando </Text>
        <Spinner></Spinner>
      </View>
    ) : (
      <React.Fragment>
        <View style={styles.top}>
          <Text style={styles.title}> {foundProductsText}</Text>
          {this.renderButton()}
        </View>
        {this.state.filtersActive ? (
          <React.Fragment>
            <FilterProduct
              list={origin}
              addFilterOption={this.filterOrigin.bind(this)}
            />
          </React.Fragment>
        ) : (
          <View></View>
        )}
        
        {
          this.state.products.length === 0 ? (
            <View style={styles.loading}>
              <Text style={styles.title}> No se encontraron productos </Text>
            </View>
          ) : (
            <FlatList
            style={styles.flatList}
            data={this.state.products}
            renderItem={product => (
              <ProductCard
                product={product}
                showOrHideProductByStores={showOrHideProductByStores}
              />
            )}
            keyExtractor={(product, index) => {
              return product.id.toString();
            }}
          /> 
          )
        }

      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  title: {
    color: colors.white,
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 5
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flatList: {
    flex: 0.5,
    marginBottom: 10
  },
  top: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    paddingBottom: 10
  },
  userButton: {
    position: 'absolute',
    right: 10,
    top: 15,
    borderColor: Colors.primaryColor,
    backgroundColor: Colors.primaryColor,
    borderWidth: 1.5,
    borderRadius: 30,
    width: 40,
    height: 40
  }
});
