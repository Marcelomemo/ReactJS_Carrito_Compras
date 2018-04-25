import React from 'react';
import * as firebase from 'firebase';
import { Router, Route, Link, IndexRoute } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Tienda from './Tienda.jsx';
import BarraNavegacion from './BarraNavegacion.jsx';
import Carrito from './Carrito.jsx';
import LoginForm from '../Login.jsx';

class Producto extends React.Component{
  constructor(props){
    super(props)
    this.state = {
        producto : [],
        listaProductos : [],
        idProducto : [],
        atras : 0,
        siguiente : 0,
        refresh: false
      }
    }

    componentWillMount(){
    const { idProducto } = this.props.match.params;
      const listaProductos = []
      const producto = []
        if(this.state.producto == ""){ 
        firebase.database().ref("productos").once("value").then((snapshot) => {
          snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key;
            var childData = childSnapshot.val();
            if(childData.id == idProducto){
              producto.push(childData);
            }
            listaProductos.push(childData)
          });
          this.setState({listaProductos : listaProductos, producto : producto });
        })
      }
      this.navegacion(idProducto);
    }

    render() {
        return(
        <div className="tienda row">
          <div className="container">
            <BarraNavegacion contador={ this.contadorCarrito() }/>
            <div className="col s12 box carrito green darken-1">
              <h5 className="left">
                Detalle Producto
              </h5>
            </div>
            <div className="col s12 box carrito white">
              { this.mostrarProducto() }
            </div>

          </div>
          </div>
       );
    }

    mostrarProducto(){
      return this.state.producto.map(
        (producto) => { return (<DetalleProducto siguiente={ this.state.siguiente } atras={ this.state.atras } navegacion={ this.navegacion.bind(this) } listaProductos={ this.state.listaProductos } actualizarDisponible={ this.actualizarDisponible.bind(this) } key={ producto.id } producto={ producto } /> )}
      )
    }


    itemsCarrito(){
        if(sessionStorage.getItem("Carrito")){ 
            this.state.listaCarrito = JSON.parse(sessionStorage.getItem("Carrito"));
            return JSON.parse(sessionStorage.getItem("Carrito")); 
        }
        return 0; 
      
    }

    contadorCarrito(){
      return this.itemsCarrito().length 
    }

    actualizarDisponible(item, cantidad){
      for (let productoLista of this.state.producto){
        if (productoLista.id == item.id){
          this.verificarCarrito(item, cantidad)
          productoLista.disponible = (Number(productoLista.cantidad) - Number(cantidad))
          this.setState({ producto : this.state.producto })
          this.setState({ listaCarrito : this.state.listaCarrito })
        }
      }
    }



    navegacion(id:number){ 
      let back = Number(id-1); 


    }
 }
export default Producto;




class DetalleProducto extends React.Component{


constructor(props) {
  super(props);
  this.state = { 
      inputValue : 1,
      disponible : this.props.producto.cantidad,
      contadorCarrito : 0,
      listaProductos: this.props.listaProductos,
      listaCarrito: JSON.parse(sessionStorage.getItem('Carrito')) ? JSON.parse(sessionStorage.getItem('Carrito')) : [] ,
      producto : this.props.producto,
      productoCarrito : {
        id: '',
        titulo : '',
        img : '',
        cantidad : '',
      },
        atras: this.props.atras,
        siguiente : this.props.siguiente,
      };
}

componentWillMount(){
      this.checkCarrito(this.props.producto);
      this.props.navegacion(this.props.producto.id);
}

  render(){
  if(!sessionStorage.getItem('Session')){  
      return <Redirect to="/" />
  }
    const producto = this.props.producto
    return (
    <div className="left">
    <h2 className="card-title">{ producto.titulo }</h2>
        <div className="col s12 m4 l3 right">
          <div className="card">
            <div className={ this.state.disponible ? 'card-image' : 'card-image' }>
              <img src={ "../img/" + producto.img }/>
             </div>
            <div className="card-content">
              <div className="informacion blue-grey-text text-darken-2">
                <span hidden={ this.state.contadorCarrito ? false : true }className="badge carrito"><Link to="/carrito"><small className="white-text text-shadow"><i className="material-icons left">shopping_cart</i> <p className="left">{ this.state.contadorCarrito }</p></small></Link></span>
                <p><b>Precio: </b> { producto.precio } </p>
                <p><b>Disponibles: </b>{ this.state.disponible ? this.state.disponible : 'Agotado' }</p>
                
              </div>
            </div>
          </div>
        </div>
        <p className="col s12 m8 l9 right">{ producto.informacion }</p>
      </div>
    )
  }

    agregarProducto(){
       let cantidad = this.state.inputValue;
       const producto = this.props.producto;
       if (cantidad <=0) {
        alert('Seleccione una cantidad válida');
        return
       }
       if(this.state.disponible < cantidad){
         alert('Máxima existencia es: '+ this.state.disponible); 
       }else{
         let disponibles = (Number(this.state.disponible) - Number(cantidad));
         let agregarACarrito = (Number(this.state.contadorCarrito) + Number(cantidad));
         this.setState({ disponible : disponibles });
         this.setState({ contadorCarrito : agregarACarrito });
         this.state.productoCarrito.id =  producto.id;
         this.state.productoCarrito.titulo=  producto.titulo;
         this.state.productoCarrito.img =  producto.img;
         this.state.productoCarrito.precio =  producto.precio;
         this.state.productoCarrito.cantidad = (Number(this.state.productoCarrito.cantidad) +  Number(cantidad));
         this.props.actualizarDisponible(this.state.productoCarrito, cantidad, false);
       }
    }

    updateInputValue(evt) {
      this.setState({
        inputValue: evt.target.value
      });
    }

    checkCarrito(producto){
      for(let itemCarrito of this.state.listaCarrito){ 
        if(itemCarrito.id == producto.id){
          let actualizarDisponible = (Number(this.state.disponible) - Number(itemCarrito.cantidad));
          this.setState({disponible : actualizarDisponible, contadorCarrito : itemCarrito.cantidad});
        }
      }
    }
}
