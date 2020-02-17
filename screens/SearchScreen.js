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
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Icon } from 'native-base';
import Colors from '../constants/Colors';
import { firebaseApp } from '../config/firebase';
import FilterProduct from '../components/FilterProduct';
import CategoryButton from '../components/CategoryButton';
import { DISHES, PRODUCTS } from '../constants/Category';

const platos = ['Desayuno o Merienda', 'Almuerzo o Cena'];
const productos = [
  'Panificados',
  'Bebidas',
  'Chocolates',
  'Cereales',
  'Harinas'
];
const screenWidth = Math.round(Dimensions.get('window').width);
const screenHeight = Math.round(Dimensions.get('window').height);

class SearchScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchText: '',
      celiac_status: {},
      userPreferences: {
        dishes: [],
        products: []
      },
      textInputStatus: 'untouched',
      food: false,
      typeProduct: '',
      item: true,
      products: [],
      filtersActive: false,
      pressStatus: 0,
      list: [],
      filterOption: -1,
      userData: false,
      gustos:[],
      preferencias:[]
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
    this.getDish = this.getDish.bind(this);
    this.getProd = this.getProd.bind(this);
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
      <KeyboardAvoidingView style={styles.bar} behavior="padding" enabled>
        <TextInput
          style={styles.textInput}
          onChangeText={text => this.viewClearButton(text)}
          onSubmitEditing={() => this.searchProduct()}
          value={this.state.searchText}
          placeholder="Buscar producto"
        />
        {this.renderClearButton()}
      </KeyboardAvoidingView>
    );
  }

  async getUserData() {
    const { navigation } = this.props;
    const uid = navigation.getParam('uid');
    await this.userRef.once('value', snap => {
      snap.forEach(child => {
        if (child.key === uid)
          this.setState({
            celiac_status: child.val().celiac_status,
            userPreferences: {
              dishes: child.val().preferences.dishes,
              products: child.val().preferences.products
            },
            userData: true,
          });
      });
    });
    this.makeArrays();
    // console.log('preferences:', this.state.userPreferences);
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
    const filterOption = this.state.filterOption;
    // console.log('user celiac status: ', this.state.celiac_status);
    // console.log('search text: ', this.state.searchText );
    // console.log('tipo de producto: ', this.state.typeProduct);
    // console.log('filter option: ', this.state.filterOption);
    let products = [];
    await this.productsRef.once('value', snap => {
      snap.forEach(child => {
        products.push({
          id: child.val().id,
          name: child.val().name,
          brand: child.val().brand,
          quantity: child.val().quantity,
          origin: child.val().origin,
          category: child.val().category,
          marsh3Allowed: child.val().marsh3Allowed,
          type: child.val().type,
          _key: child.key
        });
      });

      // console.log('antes de los filtros: ', products);

      if (userCeliacStatus)
        products = products.filter(
          product => product.marsh3Allowed === userCeliacStatus
        );
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>despues del celiac status: ', products);
      if (type != '')
        products = products.filter(product => product.type === type);
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>despues del type: ', products);
      if (filterOption != -1)
        products = products.filter(
          product => product.category === filterOption
        );
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>despues de la categoria: ', products);
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTxt.toLowerCase())
      );
      // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Array Final: ', products);
      this.props.navigation.navigate('ProductsScreen', { products });
    });
  } //! END SEARCH PRODUCT METHOD

  goToProfile() {
    const { navigation } = this.props;
    const uid = navigation.getParam('uid');
    this.props.navigation.navigate('ProfileScreen', { uid });
  }

  goToStores() {
    const { navigation } = this.props;
    const uid = navigation.getParam('uid');
    this.props.navigation.navigate('StoresScreen', { uid });
  }

  depressed() {
    this.setState({
      pressStatus: 0,
      filtersActive: false,
      filterOption: -1,
      typeProduct: ''
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
      filterOption: -1
    });
    if (text === 'prod') {
      this.state.list = productos;
    } else {
      this.state.list = platos;
    }
  }

  addFilterOption(option) {
    this.setState({
      filterOption: option
    });
  }

  getDish(id) {
    this.searchProductBySubcategory(id, 'meal');
  }

  getProd(id) {
    this.searchProductBySubcategory(id, 'prod');
  }

  async searchProductBySubcategory(subcategory, type) {
    const userCeliacStatus = this.state.celiac_status;

    let products = [];
    await this.productsRef.once('value', snap => {
      snap.forEach(child => {
        products.push({
          id: child.val().id,
          name: child.val().name,
          brand: child.val().brand,
          quantity: child.val().quantity,
          origin: child.val().origin,
          subcategory: child.val().subcategory,
          marsh3Allowed: child.val().marsh3Allowed,
          type: child.val().type,
          _key: child.key
        });
      });

      if (userCeliacStatus)
        products = products.filter(
          product => product.marsh3Allowed === userCeliacStatus
        );
      products = products.filter(product => product.type === type);
      products = products.filter(
        product => product.subcategory === subcategory
      );
      this.props.navigation.navigate('ProductsScreen', { products });
    });
  } //! END SEARCH PRODUCT METHOD

  makeArrays() {
    const dishes = Object.values(this.state.userPreferences.dishes);
    const products = Object.values(this.state.userPreferences.products);

    let platos = [];
    let productos = [];
    dishes.forEach((dish, index) => {
      if (dish.toggled) platos.push(index);
    });
    products.forEach((product, index) => {
      if (product.toggled) productos.push(index);
    });

    platos = DISHES.filter((item, index) => platos.includes(index));
    productos = PRODUCTS.filter((item, index) => productos.includes(index));

    this.setState({
      gustos: platos,
      preferencias: productos,
    });
  }

  render() {
    const {gustos, preferencias} = this.state;
    const productos = preferencias.map((item, index) => (
      <CategoryButton
        key={index}
        getSubcategory={this.getProd.bind(this)}
        title={item.title}
        url={item.id}
        idx={index}
      />
    ));
    const platos = gustos.map((item, index) => (
      <CategoryButton
        key={index}
        getSubcategory={this.getDish.bind(this)}
        title={item.title}
        url={item.id}
        idx={index}
      />
    ));
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView>
          <View style={styles.sectionTop}>
            <TouchableOpacity
              style={styles.userButton}
              onPress={() => this.goToProfile()}
            >
              <Icon name="person" />
            </TouchableOpacity>
            <Text
              style={styles.storesButton}
              onPress={() => this.goToStores()} >
              Conocé los locales sin TACC
            </Text>
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

          <View style={styles.recomendations}>
            <Text style={{ paddingLeft: 10 }}>Platos recomendados</Text>
            {this.state.userData ? (
              <React.Fragment>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  {platos}
                </ScrollView>
              </React.Fragment>
            ) :  (<ActivityIndicator  style={styles.load} size='large' />)}
          </View>
          <View style={styles.recomendations}>
            <Text style={{ paddingLeft: 10 }}>Productos recomendados</Text>
            {this.state.userData ? (
              <React.Fragment>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  {productos}
                </ScrollView>
              </React.Fragment>
            ) :  (<ActivityIndicator  style={styles.load} size='large' />)}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchOptions: {
    // flex: 0.5,
    justifyContent: 'center',
    width: '100%'
    // backgroundColor: Colors.primaryLightColor
  },
  searchBar: {
    // flex: 1,
    paddingTop: 5,
    alignItems: 'center'
    // width: '100%'
    // backgroundColor: Colors.secondaryLightColor
  },
  options: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 5
  },
  option: {
    height: screenHeight * 0.2,
    width: screenWidth * 0.4,
    borderRadius: 20
  },
  optionPressed: {
    height: screenHeight * 0.2,
    width: screenWidth * 0.4,
    borderRadius: 20,
    opacity: 0.65
  },
  imageOption: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end'
  },
  textOption: {
    textAlign: 'center',
    fontSize: 24,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)'

    // color: Colors.white,
    // fontWeight: "bold"
  },
  title: {
    padding: 5,
    textAlign: 'center'
  },
  textInput: {
    flex: 1,
    borderRadius: 8,
    height: 40,
    borderWidth: 2,
    borderColor: Colors.primaryColor,
    margin: 10,
    padding: 10,
    color: Colors.primaryTextColor,
    backgroundColor: Colors.white
  },
  button: {
    height: 15,
    width: 15,
    marginRight: 20,
    marginLeft: 5
  },
  sectionTop: {
    flex: 1,
    //? CONTENEDOR DEL BOTON PARA DATOS DE USUARIO
    // backgroundColor: Colors.secondaryColor,
    padding: 5,
    marginTop: 10,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between'
  },
  userButton: {
    borderColor: Colors.primaryColor,
    backgroundColor: Colors.primaryColor,
    borderWidth: 1.5,
    borderRadius: 30,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  storesButton: {
    width: 'auto',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 20,
    paddingTop: 10,
    color: Colors.secondaryDarkColor,
    fontWeight: 'bold'
  },
  bar: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center'
  },
  load: {
    height: screenHeight * .2
  },
});
