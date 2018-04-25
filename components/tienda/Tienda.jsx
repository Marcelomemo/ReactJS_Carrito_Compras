import React from 'react';
import { Redirect } from 'react-router-dom';
import * as firebase from 'firebase';
import BarraNavegacion from './BarraNavegacion.jsx';
import Catalogo from './Catalogo.jsx';

class Tienda extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            catalogo: [],
            productos: [],
            listaCarrito : [],
            loader : true
        }
        this.actualizarDisponible = this.actualizarDisponible.bind(this)
    }

    componentWillMount(){
        const listaProductos = []  
        firebase.database().ref("productos").once("value").then((snapshot) => {
            snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key;
                var childData = childSnapshot.val();
                listaProductos.push(childData);
            });
            this.setState({ catalogo : listaProductos });
            this.setState({ productos : this.state.catalogo });
        })
    }

    render(){
        if(!sessionStorage.getItem('Session')){
          return <Redirect to="/" />
        }

      return(
          <div className="tienda row">
              <div className="container">
                  <BarraNavegacion contador={ this.contadorCarrito() }/>
                  <div className="left lista-productos box">
                      <div className="col s12 green darken-1 animated fadeInDown fast">
                          <h4 className="col m6 s12 white-text left ">Cátalogo de productos</h4>
                          <h4 className="right col m6 s12 input-field">
                              <i className="material-icons prefix white-text">search</i>
                              <input onChange={ this.filtrarCatalogo.bind(this) } type="text" id="descripcion" laceholder="aguacate"  type="text" className="white-text no-margin-bottom"/>
                              <label htmlFor="descripcion" className="white-text">¿Qué estás buscando?</label>
                          </h4>
                      </div>
                      { this.mostrarProductos() }
                  </div>
              </div>
          </div>
      )
    }

    mostrarProductos(){
        return this.state.productos.map(

            (producto) => { return <Catalogo actualizarDisponible={ this.actualizarDisponible } productos={this.state.productos} key={ producto.id } id={ producto.id }  titulo={ producto.titulo } img={ producto.img } descripcion={ producto.titulo } disponible={ producto.cantidad } precio ={ producto.precio } /> }
        )
    }

    filtrarCatalogo(event){
        this.state.productos = this.state.catalogo; 
        let palabraFiltro = event.target.value.toLowerCase(); 
        let itemMatch = []; 
        for(let item of this.state.productos){
            let titulo = item.titulo.toLowerCase();
            if(titulo.includes( palabraFiltro )){ 
                itemMatch.push(item)
            }
        }
        this.setState({productos : itemMatch}); 
        if(itemMatch.length == 0){ 
            this.state.productos = []
        }
    }

    actualizarDisponible(item, cantidad){
        for (let productoLista of this.state.productos){
            if (productoLista.id == item.id){ 
                this.verificarCarrito(item, cantidad)
                productoLista.disponible = (Number(productoLista.disponible) - Number(cantidad)) 
                this.setState({ productos : this.state.productos }) 
                this.setState({ listaCarrito : this.state.listaCarrito }) 
            }
        }
    }

    verificarCarrito(item, cantidad){
        if(this.guardarCarrito(item, cantidad) == false){  
            this.state.listaCarrito.push(item) 
        }
        this.setState({listaCarrito : this.state.listaCarrito}) 
        sessionStorage.setItem("Carrito", JSON.stringify(this.state.listaCarrito)); 
    }

    guardarCarrito(item, cantidad){
        if(this.state.listaCarrito.length > 0){   
            for(let itemGuardado of this.state.listaCarrito){
                if(itemGuardado.id == item.id){ 
                    itemGuardado.cantidad = (Number(itemGuardado.cantidad) + Number(cantidad))
                    return true 
                }
            }
            return false; 
        }
        return false; 
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
}

export default Tienda;
