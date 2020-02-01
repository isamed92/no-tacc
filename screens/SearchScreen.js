import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  TextInput,
  ImageBackground
} from 'react-native';
import { Button, Icon } from 'native-base';
import Colors from '../constants/Colors';
import { firebaseApp } from '../config/firebase';
import FilterProduct from '../components/FilterProduct';

const platos = [
  'Desayuno', 
  'Almuerzo', 
  'Merienda', 
  'Cena'
];
const productos = [
  'Panificados', 
  'Bebidas', 
  'Chocolates', 
  'Cereales', 
  'Harinas'
];

class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      celiac_status: {},
      textInputStatus: 'untouched',
      food: false,
      typeProduct: '',
      item: true,
      products: [],
      filtersActive: false,
      pressStatus: 0,
      list: [],
      filterOptions: []
    };
    this.userRef = firebaseApp
      .database()
      .ref()
      .child('users');
    this.productsRef = firebaseApp
      .database()
      .ref()
      .child('products');

    this.addFilterOption = this.addFilterOption.bind(this);
  }

  viewClearButton(text) {
    this.setState({
      searchText: text,
      textInputStatus: 'touched'
    });
  }

  clearText() {
    this.setState({
      textInputStatus: 'untouched',
      searchText: ''
    });
  }

  renderClearButton() {
    if (this.state.textInputStatus == 'touched') {
      return (
        <TouchableOpacity onPress={() => this.clearText()}>
          <Image
            style={styles.button}
            source={require('../assets/img/clear-input.png')}
          />
        </TouchableOpacity>
      );
    } else {
      return <View />;
    }
  }

  renderSearchBar() {
    return (
      <View style={styles.bar}>
        <TextInput
          style={styles.textInput}
          onChangeText={text => this.viewClearButton(text)}
          onSubmitEditing={() => this.searchProduct()}
          value={this.state.searchText}
          placeholder="Buscar producto"
        />
        {this.renderClearButton()}
      </View>
    );
  }

  async getUserData() {
    const { navigation } = this.props;
    const uid = navigation.getParam('uid');
    await this.userRef.once('value', snap => {
      snap.forEach(child => {
        if (child.key === uid)
          this.state.celiac_status = child.val().celiac_status;
      });
    });
    // console.log('usuario: ', this.state.user);
  }

  componentDidMount() {
    this.getUserData();
  }

  async searchProduct() {
    if (this.state.searchText == '') {
      return;
    }
    const userCeliacStatus = this.state.celiac_status;
    const searchTxt = this.state.searchText;
    const type = this.state.typeProduct;

    let products = [];
    await this.productsRef.once('value', snap => {
      if (type == '') {
        snap.forEach(child => {
          // console.log('marsh: ',child.val().marsh3Allowed);
          // console.log('celic status: ', userCeliacStatus);
          products.push({
            id: child.val().id,
            name: child.val().name,
            brand: child.val().brand,
            quantity: child.val().quantity,
            marsh3Allowed: child.val().marsh3Allowed,
            _key: child.key
          });
          if (
            userCeliacStatus &&
            child.val().marsh3Allowed != userCeliacStatus
          ) {
            products.pop(child);
          }
        });
      } else {
        snap.forEach(child => {
          // console.log('marsh: ',child.val().marsh3Allowed);
          // console.log('celic status: ', userCeliacStatus);
          products.push({
            id: child.val().id,
            name: child.val().name,
            brand: child.val().brand,
            quantity: child.val().quantity,
            marsh3Allowed: child.val().marsh3Allowed,
            _key: child.key
          });
          if (
            (userCeliacStatus &&
              child.val().marsh3Allowed != userCeliacStatus) ||
            type != child.val().type
          ) {
            products.pop(child);
          }
        });
      }
      //? OPTIMIZAR ESTO PLS
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTxt.toLowerCase())
      );
      // console.log('productos buscados: ',products);
      this.props.navigation.navigate('ProductsScreen', { products });
    });
  } //! END SEARCH PRODUCT METHOD

  goToProfile() {
    const { navigation } = this.props;
    const uid = navigation.getParam('uid');
    this.props.navigation.navigate('ProfileScreen', { uid });
  }

  depressed() {
    this.setState({
      pressStatus: 0,
      filtersActive: false,
      filterOptions: []
    });
  }

  pressed(text, id) {
    if (this.state.pressStatus === id) {
      this.depressed();
      return;
    }
    this.setState({
      typeProduct: text,
      pressStatus: id,
      filtersActive: true,
      filterOptions: []
    });
    if (text === 'prod') {
      this.state.list = productos;
    } else {
      this.state.list = platos;
    }
  }

  addFilterOption(option) {
    if (this.state.filterOptions.find(opt => opt == option) === undefined)
      this.state.filterOptions.push(option);
    else return;
    console.log('opciones de filtro seleccionadas: ', this.state.filterOptions);
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.sectionTop}>
          <TouchableOpacity
            style={styles.userButton}
            onPress={() => this.goToProfile()}
          >
            <Icon name="person" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchOptions}>
          <Text style={styles.title}>
            Ingrese el tipo de producto que desea
          </Text>
          <View style={styles.options}>
            <TouchableHighlight
              onPress={() => this.pressed('prod', 1)}
              style={
                this.state.pressStatus === 1
                  ? styles.optionPressed
                  : styles.option
              }
            >
              <ImageBackground
                source={require('../assets/img/productos.jpg')}
                imageStyle={{ borderRadius: 20 }}
                style={styles.imageOption}
              >
                <Text style={styles.textOption}>Productos</Text>
              </ImageBackground>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={() => this.pressed('meal', 2)}
              style={
                this.state.pressStatus === 2
                  ? styles.optionPressed
                  : styles.option
              }
            >
              <ImageBackground
                source={require('../assets/img/platos.jpg')}
                imageStyle={{ borderRadius: 20 }}
                style={styles.imageOption}
              >
                <Text style={styles.textOption}>Platos</Text>
              </ImageBackground>
            </TouchableHighlight>
          </View>
          {this.state.filtersActive ? (
            <React.Fragment>
              <FilterProduct
                list={this.state.list}
                addFilterOption={this.addFilterOption.bind(this)}
              />
            </React.Fragment>
          ) : (
            <View></View>
          )}
        </View>
        <View style={styles.searchBar}>
          <Text>Ingrese el nombre del producto</Text>
          {this.renderSearchBar()}
        </View>
      </SafeAreaView>
    );
  }
}
export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    // flex: 1
  },
  searchOptions: {
    // flex: 0.5,
    justifyContent: 'center',
    width: '100%'
    // backgroundColor: Colors.primaryLightColor
  },
  searchBar: {
    // flex: 1,
    paddingTop: 30,
    alignItems: 'center'
    // width: '100%'
    // backgroundColor: Colors.secondaryLightColor
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20
  },
  option: {
    height: 150,
    width: '45%',
    borderRadius: 20
    // backgroundColor: Colors.secondaryColor,
    // paddingVertical: 20,
  },
  optionPressed: {
    height: 150,
    width: '45%',
    borderRadius: 20,
    opacity: 0.65
  },
  imageOption: {
    width: '100%',
    height: '100%'
  },
  textOption: {
    textAlign: 'center',
    fontSize: 22,
    paddingTop: 50
  },
  title: {
    padding: 20,
    textAlign: 'center',
    marginBottom: 5
  },
  //------------------------------------------
  textInput: {
    flex: 1,
    borderRadius: 8,
    height: 40,
    borderWidth: 2,
    borderColor: colors.primaryColor,
    margin: 10,
    padding: 10,
    color: colors.primaryTextColor,
    backgroundColor: colors.white
  },
  button: {
    height: 15,
    width: 15,
    marginRight: 20,
    marginLeft: 5
  },
  sectionTop: {
    // backgroundColor: colors.secondaryColor,
    padding: 20,
    flexDirection: 'row-reverse'
  },
  userButton: {
    borderColor: colors.primaryColor,
    backgroundColor: colors.primaryColor,
    borderWidth: 1.5,
    borderRadius: 30,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bar: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center'
  }
});
