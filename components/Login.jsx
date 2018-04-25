import React from 'react';
import ReactDOM from 'react-dom';
import * as firebase from 'firebase';
import * as request from 'superagent';
import { Router, Route, Link, Redirect } from 'react-router-dom'
import LoginFirebase from './FirebaseDB.jsx';

const USUARIODB = firebase.database().ref().child('usuarios')

class LoginForm extends React.Component{
    constructor(props) {
        super(props);
        this.state = { 
          usuario: '',
          password: '',
          mensaje: '',
        };
        this.handleChange = this.handleChange.bind(this);
        this.checkLogin = this.checkLogin.bind(this);
    }

    checkSession(){
        return sessionStorage.getItem("Session");
    }

    handleChange(event) {

        if(event.target.id == "usuario"){ 
            this.setState({ usuario: event.target.value });
        }
        if(event.target.id == "password"){ 
            this.setState({ password: event.target.value });
        }
    }

    checkLogin(event) {
      
        event.preventDefault(); 
        let usuario = this.state.usuario
        let password = this.state.password; 
        let mensajeLogin = 'Error de Login';

        USUARIODB.child(usuario).once('value', function(snapshot) {
        console.log("Aqui estoy " + usuario + "  " + snapshot.val())
        let userData = snapshot.val();
            if (userData !== null) { 

                console.log ('Usuario correcto: ' + userData.usuario)
                if (userData.password == password){ 
                    mensajeLogin = "Iniciando Sesión"; 
                    sessionStorage.setItem("Session", usuario); 

                }else{
                    mensajeLogin = 'Contraseña incorrecta'; 
                }
            }else{
                mensajeLogin = "El usuario " + usuario + " no existe"; 
            }
        });
        this.setState({ mensaje : mensajeLogin }); 
        console.log(mensajeLogin)
    }

    render(){
        if (this.checkSession()){
            return <Redirect to='/tienda'/>
        }
        return(

        <div className="login row">
            <div className="login col s12 m6 l4 offset-m3 offset-l4">
                <div className="card card-login">
                    <div className="card-content">
                        <span className="card-title black-text"> Iniciar Sesión </span>
                        <form onSubmit={ this.checkLogin } >
                            <div className="row">
                                <div className="input-field col s12">
                                  <input type="text" ref="usuario" id="usuario" value={ this.state.usuario } onChange={ this.handleChange } className="validate " placeholder="Usuario" required aria-required="true" />
                                </div>
                            </div>

                            <div className="row">
                              <div className="input-field col s12">
                                <input type="password" ref="password" id="password" value={ this.state.password } onChange={ this.handleChange } className="validate " placeholder="Contraseña" required aria-required="true" /> 
                              </div>
                            </div>

                            <div className="row">
                              <div className="input-field col s12">
                                <button className="btn" type="submit" > Ingresar </button> 
                              </div>
                            </div>

                            <div className="row">
                              <div className="input-field col s12">
                                <span className="red-text text-darken-2" > { this.state.mensaje } </span>
                              </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>

     );
    }


}

export default LoginForm;
