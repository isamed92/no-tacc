import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  YellowBox,
  Platform,
  StatusBar,
} from 'react-native';

import colors from './constants/Colors';


import { firebaseApp } from './config/firebase';
import * as Font from 'expo-font';

import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import { createStackNavigator } from 'react-navigation-stack';

import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import ProductsScreen from './screens/ProductsScreen';
import ProfileScreen from './screens/ProfileScreen';
import StoresScreen from './screens/StoresScreen';
import SearchScreen from './screens/SearchScreen';
import Colors from './constants/Colors';

const AppSwitchNavigator = createSwitchNavigator({
  LoadingScreen: LoadingScreen,
  LoginScreen: LoginScreen,
  // ProductsScreen: ProductsScreen,
  // ProfileScreen: ProfileScreen,
  SearchScreen: SearchScreen
});

const AppStackNavigator = createStackNavigator({
  // LoadingScreen: LoadingScreen,
  // LoginScreen: LoginScreen,
  PRCeliaco: {
    screen: AppSwitchNavigator,
    navigationOptions: {
      headerShown: false,
    }
  },
  ProductsScreen: {
    screen: ProductsScreen,
    navigationOptions: {
      headerTitle: 'Lista de Productos'
    }
  },
  ProfileScreen: {
    screen: ProfileScreen,
    navigationOptions: {
      headerTitle: 'Perfil de Usuario'
    }
  },
  StoresScreen: {
    screen: StoresScreen,
    navigationOptions: {
      headerTitle: 'Locales sin TACC'
    }
  },
  // SearchScreen: SearchScreen
},
{
  initialRouteName: 'PRCeliaco',
  headerMode: 'screen' ,
  /* The header config from HomeScreen is now here */
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: Colors.primaryDarkColor,      
    },
    cardStyle: {
      backgroundColor: colors.primaryColor,

    }
  },
}
);

const AppNavigator = createAppContainer(AppStackNavigator);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      ProductByStoresVisible: false,
      product: {},
      allProducts: [],
      activeApp: true
    };

    this.productsRef = firebaseApp
      .database()
      .ref()
      .child('products');
    this.activeAppRef = firebaseApp
      .database()
      .ref()
      .child('activeApp');

    showOrHideProductByStores = this.showOrHideProductByStores.bind(this);

    console.disableYellowBox = true;
    console.warn('YellowBox is disabled.');
    YellowBox.ignoreWarnings(['Warning: ...']);
    console.ignoredYellowBox = ['Setting a timer'];
  }

  componentWillMount() {
    this.listenForProducts(this.productsRef);
    this.listenForActiveApp(this.activeAppRef);
  }

  async componentDidMount() {
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
    });
  }

  showOrHideProductByStores(product) {
    if (!this.state.ProductByStoresVisible) {
      this.setState({
        ProductByStoresVisible: !this.state.ProductByStoresVisible,
        product: {
          name: product.name,
          id: product.id
        }
      });
    } else {
      this.setState({
        ProductByStoresVisible: !this.state.ProductByStoresVisible,
        product: {}
      });
    }
  }

  listenForProducts(productsRef) {
    productsRef.on('value', snap => {
      let products = [];
      snap.forEach(child => {
        products.push({
          id: child.val().id,
          name: child.val().name,
          brand: child.val().brand,
          quantity: child.val().quantity,
          marsh3Allowed: child.val().marsh3Allowed,
          _key: child.key
        });
      });

      this.setState({
        allProducts: products,
        products: products
      });
    });
  }

  listenForActiveApp(activeAppRef) {
    activeAppRef.on('value', snap => {
      let activeApp = snap.val();
      this.setState({ activeApp: activeApp });
    });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {Platform.OS === 'ios' && <StatusBar barStyle='default' />}
        {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}

        {this.state.activeApp ? (
          <React.Fragment>
            <AppNavigator />
          </React.Fragment>
        ) : (
          <View style={styles.activeApp}>
            <Text style={styles.title}>Aplicación no activa</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryColor
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: colors.black
  },
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
  searchSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    height: 15,
    width: 15,
    marginRight: 20,
    marginLeft: 5
  },
  activeApp: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    color: colors.white
  },
  header: {
    fontSize: 25
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 40
  }
});
