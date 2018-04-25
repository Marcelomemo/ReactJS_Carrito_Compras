import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from 'firebase';

  const totalUsers : Object = [];
  const config = {
    apiKey: "AIzaSyCaRd4XTjcClheDfhp2RY4-sZea00YW8kI",
    authDomain: "catalogo-dbe32.firebaseapp.com",
    databaseURL: "https://catalogo-dbe32.firebaseio.com",
    projectId: "catalogo-dbe32",
    storageBucket: "catalogo-dbe32.appspot.com",
    messagingSenderId: "942286529358"
  };
  firebase.initializeApp(config);

const productosDb = firebase.database().ref().child('productos')
const usuariosDb = firebase.database().ref().child('usuarios')

usuariosDb.orderByChild("nombre").on("child_added", function(snapshot) {
  totalUsers.push(snapshot.key)
});
