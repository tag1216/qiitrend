import React, { propTypes } from "react";
import { Component } from "react";

import url from "url";

import Header from "./components/Header";


export default class App extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.mapParamsToState(this.props.location);
  }

  componentWillReceiveProps(nextProps) {
    this.mapParamsToState(nextProps.location);
  }

  mapParamsToState(location) {
    const urlQuery = url.parse(location.search, true).query;
    const props = {
      queries: !urlQuery.query ? [] : typeof urlQuery.query == "string" ? [urlQuery.query] : urlQuery.query
    };
    this.setState({...props});
  }

  render() {
    return (
      <div>
        <Header/>
        <main>
          { this.props.children && React.cloneElement(this.props.children, {...this.state}) }
        </main>
      </div>
    );
  }
}
