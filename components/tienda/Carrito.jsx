import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import * as request from 'superagent';
import { FormattedMessage } from 'react-intl';
import BarraNavegacion from './BarraNavegacion.jsx';
import CarritoDetalle from './CarritoDetalle.jsx'

class Carrito extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      listaCarrito : [],
      inputValue:0,
      redirect : false,
      counter : 1,
      pagar : false
    }
    this.vaciarCarrito = this.vaciarCarrito.bind(this)
  }
  componentWillMount(){
    this.setState({listaCarrito : JSON.parse(sessionStorage.getItem('Carrito')) ? JSON.parse(sessionStorage.getItem('Carrito')) : '[]' })
  }
  render(){
    if(!sessionStorage.getItem('Session')){ 
      return <Redirect to="/" />
    }
    if(this.contadorCarrito()){
      return(
        <div className="tienda row">
          <div className="container">
            <BarraNavegacion contador={ this.contadorCarrito() }/>
            <div className="animated fadeIn slow">
              <div className="box carrito">
                <div className="row col s12 blue darken-1 animated fadeInDown fast">
                  <h5 className="col m6 s12 white-text left ">Carrito de compras</h5>
                </div>
                <div className="col l8 m6 s12">
                  { this.mostrarCarrito() }
                </div>
                <div className="col l4 m6 s12">
                  <h5 className="right col s12 right-align"><button className="btn red darken-4 btn-sm"  type="button" onClick={ this.vaciarCarrito }><i className="material-icons" style={ {'lineHeight' : '14px', 'fontSize': '17px', 'position' : 'relative', 'top': '3px'} } >delete</i> Vaciar Carrito</button></h5>
                  <h5 className="right col s12 right-align"> Total a pagar:</h5>
                  <h5 className="right col s12 right-align animated pulse fast"> <FormattedMessage   id="total"  defaultMessage={ `$ {total, number}` } values={ {total : this.total()} }  /></h5>
                  <p className="right">
                    <button onClick={ this.pagarCarrito.bind(this) } className="btn green darken-1" type="button"  ><i className="material-icons">credit_card</i> Pagar</button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }else if(!this.contadorCarrito() && this.state.redirect == false){
      return (
        <div className="tienda row">
          <div className="container">
            <BarraNavegacion contador={ this.contadorCarrito() }/>
            <div className="animated fadeIn slow">
              <div className="box white col s12 center-align" style={ {padding: '5%'} }>
                <h5  style={{height : '70vh', display : 'table-cell', verticalAlign : 'middle'}} >No ha agregado productos al carrito de compras. Lo invitamos a dar un paseo por nuestra <Link to="/tienda">Tienda Virtual</Link></h5>
              </div>
            </div>
          </div>
        </div>
      )
    }else{
      return <Redirect to="/tienda"/>;
    }
  }
  mostrarCarrito(){
    return this.state.listaCarrito.map(
      (producto) => { return <CarritoDetalle key={ producto.id } id={ producto.id }  descripcion={ producto.titulo } img={ producto.img } descripcion={ producto.descripcion } cantidad={ producto.cantidad } precio ={ producto.precio } actualizarDisponible={ this.actualizarDisponible.bind(this) }/> }
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

  actualizarDisponible(item:Object, cantidad:Number, remover:Boolean = false){
    for (let productoLista of this.state.listaCarrito){
      if (productoLista.id == item.id){
        productoLista.cantidad = cantidad
        if(productoLista.cantidad == 0 || remover == true){
          this.removerItem(item)
        }
      }
    }
    sessionStorage.setItem("Carrito", JSON.stringify(this.state.listaCarrito))
    this.setState({ listaCarrito : this.state.listaCarrito })
  }
  removerItem(item){
    let index = this.state.listaCarrito.findIndex(producto => producto.id === item.id)
    let newArray =   this.state.listaCarrito.splice(index, 1)
  }
  vaciarCarrito(){
    this.setState({listaCarrito : []})
    sessionStorage.setItem('Carrito', '[]')
  }

  total(){
    let total :number = 0 
    let items = this.state.listaCarrito; 
    for(let subtotal of items ){ 
      total += subtotal.cantidad * subtotal.precio; 
    }
    return total; 
  }

  pagarCarrito(){
    const listaCarrito = this.state.listaCarrito 
    this.setState({ pagar : true})
    request
    .get('https://tienda-angular2.firebaseio.com/productos/.json') 
    .then((res) => {
      if( res.error || !res.ok){
        console.log('Se produjo un error al realizar la petición al servidor. '+error )
        alert('Se produjo un error al realizar la petición al servidor. '+error )
      }else{
        console.log('Conexión establecida. Actualizando base de datos')
        const respuesta = res.text  
        let catalogo = JSON.parse(respuesta) 
        for (let itemCatalogo of catalogo){  
          for (let item of listaCarrito){ 
            if ( itemCatalogo.id == item.id ){ 
              let cantidad = Number(item.cantidad); 
              itemCatalogo.disponible = itemCatalogo.disponible - cantidad; 
              this.actualizarDB(itemCatalogo, cantidad) 
            }
          }
        }
      }
    }
  )
}

actualizarDB(itemCatalogo, cantidad){
  request.put(`https://tienda-angular2.firebaseio.com/productos/${itemCatalogo.id}.json`)
  .set('Content-Type', 'application/json') 
  .send(itemCatalogo)
  .then((res) => {  
    if( res.error || !res.ok){ 
      console.log('Se produjo un error al actualizar la base de datos. '+error );
      alert('Se produjo un error al actualizar la base de datos. '+error) 
    }else{
      if(this.state.listaCarrito.length == 1){  
        this.vaciarCarrito()
        this.setState({ redirect : true })
      }else{
        let counter = (Number(this.state.counter) + 1)
        if(counter == this.state.listaCarrito.length){ 
          this.vaciarCarrito()  
          this.setState({ counter : counter})  
          this.setState({ redirect : true })
        }else{
          this.setState({ counter : counter}) 
        }
      }
    }
  })
}

    componentDidUpdate(){
        console.log('Actualización de disponibilidad correcta.'); 
    }
}

export default Carrito;
