import React, {Fragment, useEffect, useState} from 'react';
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import {BrowserRouter as Router, Switch, Route, Redirect} from "react-router-dom";


//components
 import InputItem from "./components/Input";
 import ListItems from "./components/ItemList";
 import LandingPage from "./components/Landing";

 import Homepage from "./components/Homepage";
 import Register from "./components/Register";
 import Login from "./components/Login";
 import PetOwner from "./components/PetOwner";

toast.configure();

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
  }

  async function isAuth() {
    try {
      const response = await fetch("http://localhost:5000/auth/is-verify", {
        method: "GET",
        headers: {token: localStorage.token}
      });

      const parseResponse = await response.json()
      parseResponse === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
    } catch (err) {
      console.error(err.message)
    }
  }
  useEffect(() => {
    isAuth()
  })

  return (
    <Fragment>
      <Router>
        <div className="container">
          <Switch>
          <Route exact path = "/" render={props => !isAuthenticated ? 
              (<LandingPage {...props} setAuth={setAuth}/>) : (<Redirect to="/home" />) } />
            <Route exact path = "/login" render={props => !isAuthenticated ? 
              (<Login {...props} setAuth={setAuth}/>) : (<Redirect to="/home" />) } />
            <Route exact path = "/register" render={props => !isAuthenticated ? 
              (<Register {...props} setAuth={setAuth}/>) : (<Redirect to="/home" />)}/>
            <Route exact path = "/home" render={props => isAuthenticated ? 
            (<Homepage {...props} setAuth={setAuth}/>) : (<Login {...props} setAuth={setAuth}/>) }/>
          </Switch>
        </div>
      </Router>
      {/* <div className="container">
      <InputItem />
      <ListItems />
      </div> */}
      
      
    </Fragment>
  );
}

export default App;
