import React, { Component } from 'react';
import {
  Picker,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  ScrollView
} from 'react-native';

import { firebaseApp } from '../config/firebase';
import { TouchableOpacity } from 'react-native-gesture-handler';

import firebase from 'firebase';
import { DISHES, PRODUCTS } from '../constants/Category';
import Colors from '../constants/Colors';

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        celiac_status: false
      },
      products: [],
      dishes: [],
      selected: 'key0',
      isUser: false
    };
    const { navigation } = this.props;
    uid = navigation.getParam('uid');
    this.userRef = firebaseApp.database().ref('users/' + uid);
  }

  async getUserData() {
    await this.userRef.once('value', snap => {
      this.setState({
        user: {
          uid: snap.key,
          celiac_status: snap.val().celiac_status,
          first_name: snap.val().first_name,
          last_name: snap.val().last_name,
          profile_picture: snap.val().profile_picture
        },
        products: Object.values(snap.val().preferences.products),
        dishes: Object.values(snap.val().preferences.dishes),
        isUser: true
      });

      this.state.user.celiac_status
        ? this.onValueChange('key1')
        : this.onValueChange('key0');
    });
  }

  componentDidMount() {
    this.getUserData();
  }

  componentWillReceiveProps() {
    this.getUserData();
  }

  onValueChange(value) {
    this.setState({
      selected: value
    });
    switch (value) {
      case 'key0':
        this.state.user.celiac_status = false;
        break;
      case 'key1':
        this.state.user.celiac_status = true;
        break;
    }
  }

  next() {
    this.onValueChange(this.state.selected);
    this.userRef.update({
      celiac_status: this.state.user.celiac_status,
      preferences: {
        products: this.state.products,
        dishes: this.state.dishes
      }
    });
    
    this.props.navigation.push('PRCeliaco', {
      uid: this.state.user.uid
    });
  }

  toggleProduct(index, e) {
    const products = [...this.state.products];

    products[index].toggled = !products[index].toggled;
    this.setState({ products });
  }

  toggleDish(index, e) {
    const dishes = [...this.state.dishes];

    dishes[index].toggled = !dishes[index].toggled;
    this.setState({ dishes });
  }

  logout() {
    firebase.auth().signOut();
    this.props.navigation.navigate('LoadingScreen');
  }

  renderSwitchDish(option, index) {
    return (
      <View key={index} style={styles.switch}>
        <Switch
          onValueChange={() => this.toggleDish(index)}
          value={option.toggled}
        />
        <Text>{option.title}</Text>
      </View>
    );
  }
  renderSwitchProduct(option, index) {
    return (
      <View key={index} style={styles.switch}>
        <Switch
          onValueChange={() => this.toggleProduct(index)}
          value={option.toggled}
        />
        <Text>{option.title}</Text>
      </View>
    );
  }

  render() {
    productos = this.state.products.map((item, i) =>
      this.renderSwitchProduct(item, i)
    );
    platos = this.state.dishes.map((item, i) => this.renderSwitchDish(item, i));
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {this.state.isUser ? (
          <React.Fragment>
            <ScrollView>
              <View style={styles.header}></View>
              <Image
                style={styles.avatar}
                source={{ uri: this.state.user.profile_picture }}
              />
              <View style={styles.body}>
                <View style={styles.bodyContent}>
                  <Text style={styles.name}>
                    {this.state.user.last_name +
                      ', ' +
                      this.state.user.first_name}
                  </Text>

                  <Text style={styles.info}>Grado de Celiaquia: </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      note
                      mode='dropdown'
                      style={styles.picker}
                      selectedValue={this.state.selected}
                      onValueChange={this.onValueChange.bind(this)}
                    >
                      <Picker.Item
                        label='Grado 1: Leve/Moderado'
                        value='key0'
                      />
                      <Picker.Item label='Grado 2: Grave' value='key1' />
                    </Picker>
                  </View>

                  <Text style={styles.info}>Gustos y preferencias: </Text>
                  <View style={styles.panelsContainer}>
                    <View style={styles.panel}>
                      {/* PANEL DISHES */}
                      {platos}
                    </View>
                    <View style={styles.panel}>
                      {/* PANEL PRODUCTS */}
                      {productos}
                    </View>
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  padding: 20
                }}
              >
                <View>
                  <TouchableOpacity onPress={() => this.logout()}>
                    <Text style={styles.button}>Cerrar Sesión</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity onPress={() => this.next()}>
                    <Text style={styles.button}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </React.Fragment>
        ) : (
          <ActivityIndicator style={styles.load} size='large' />
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primaryDarkColor,
    height: 100
  },
  load: {
    paddingTop: 320
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 63,
    borderWidth: 1.5,
    borderColor: 'white',
    marginBottom: 10,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: 30,
    backgroundColor: 'white'
  },
  body: {
    marginTop: 40
  },
  bodyContent: {
    flex: 1,
    alignItems: 'center',
    padding: 30
  },
  name: {
    fontSize: 28,
    color: colors.primaryTextColor,
    fontWeight: '600'
  },
  info: {
    fontSize: 16,
    color: colors.primaryTextColor,
    marginHorizontal: 10,
    marginTop: 20,
    paddingBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.primaryTextColor,
    marginTop: 10,
    textAlign: 'center'
  },
  picker: {
    width: '100%',
    color: colors.primaryTextColor,
    fontSize: 16
    // backgroundColor: colors.secondaryColor,
  },
  pickerContainer: {
    borderRadius: 5,
    height: 50,
    backgroundColor: 'powderblue',
    width: '100%'
  },
  panelsContainer: {
    flex: 1,
    flexDirection: 'row'
  },
  panel: {
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
    backgroundColor: 'powderblue'
  },
  switch:{
    padding: 5,
  },
  button: { 
    color: Colors.secondaryDarkColor,
    textAlign: 'center',
    fontWeight: 'bold' 
  }
});
