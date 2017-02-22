import React, { propTypes } from "react";
import { Component } from "react";

import url from "url";
import querystring from "querystring";

import Header from "./components/Header";


export default class App extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  state = {
    queries: [],
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
      queries: (!urlQuery.query ? [] :
                typeof urlQuery.query == "string" ? [urlQuery.query] :
                urlQuery.query).map(value => {return {value}})
    };
    this.setState({...props});
  }

  render() {
    const childProps = {
      ...this.state,
      onAddQuery: this.onAddQuery.bind(this),
      onRemoveQuery: this.onRemoveQuery.bind(this),
    };

    return (
      <div>
        <Header/>
        <main>
          { this.props.children && React.cloneElement(this.props.children, childProps) }
        </main>
      </div>
    );
  }

  onAddQuery(query) {
    const queries = this.state.queries.concat([{value: query}]).map(q => q.value);
    this.context.router.push({
      pathname: "/trend",
      query: {
        query: queries
      },
    });
  }

  onRemoveQuery(query) {
    const queries = this.state.queries.filter(q => q !== query).map(query => query.value);
    this.context.router.push({
      pathname: "/trend",
      query: {
        query: queries
      },
    });
  }


}
