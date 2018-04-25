import React from 'react';
import { Redirect } from 'react-router-dom';
import update from 'immutability-helper'; 
import * as firebase from 'firebase';
import BarraNavegacion from './tienda/BarraNavegacion.jsx';

import Catalogo from './tienda/Catalogo.jsx';


class Tienda extends React.Component{


    constructor(props) {
        super(props)
        this.state = {
            catalogo: [],
            productos: [],
            listaCarrito : [],
        }

    }

    render(){
        return(
         <p>test</p>
        )
    }

}

export default Tienda;

