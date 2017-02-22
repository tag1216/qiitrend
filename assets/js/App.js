import React, { propTypes } from "react";
import { Component } from "react";

import Header from "./components/Header";


export default class App extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  render() {
    console.log("App.render()");
    return (
      <div>
        <Header/>
        <main>
          {this.props.children}
        </main>
      </div>
    );
  }
}
