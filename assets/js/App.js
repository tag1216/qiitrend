import React, { propTypes } from "react";
import { Component } from "react";
import request from 'superagent';
import url from "url";

import Header from "./components/Header";


const periodItems = [
  { label: '過去3ヶ月', unit: 'monthly', period: 4 },
  { label: '過去12ヶ月', unit: 'monthly', period: 13 },
  { label: '過去24ヶ月', unit: 'monthly', period: 25 },
  { label: '過去3年', unit: 'yearly', period: 4 },
  { label: '過去5年', unit: 'yearly', period: 6 },
  { label: '全期間(2011-)', unit: 'yearly', period: '' },
];

export default class App extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  state = {
    periodItems,
    queries: [],
    period: periodItems[3],
    mode: "count",
    loading: false,
  };

  componentWillMount() {
    this.mapParamsToState(this.props.location);
  }

  componentWillReceiveProps(nextProps) {
    this.mapParamsToState(nextProps.location);
  }

  mapParamsToState(location) {
    const urlQuery = url.parse(location.search, true).query;
    const queries = (!urlQuery.query ? [] :
        typeof urlQuery.query == "string" ? [urlQuery.query] :
          urlQuery.query).map(value => {return {value}});
    const period = periodItems.find(p => p.unit === urlQuery.unit && "" + p.period === urlQuery.period)
        || periodItems[3];
    const mode = urlQuery.mode || "count";

    this.setState({queries, period, mode});
    if (queries.length !== 0) {
      this.fetchItemCounts(queries, period);
    }
  }

  render() {
    const childProps = {
      ...this.state,
      onAddQuery: this.onAddQuery.bind(this),
      onRemoveQuery: this.onRemoveQuery.bind(this),
      onChangePeriod: this.onChangePeriod.bind(this),
      onChangeMode: this.onChangeMode.bind(this),
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
    const queries = this.state.queries.concat([{value: query}]);
    this.pushState(queries, this.state.period, this.state.mode);
  }

  onRemoveQuery(query) {
    const queries = this.state.queries.filter(q => q !== query);
    this.pushState(queries, this.state.period, this.state.mode);
  }

  onChangePeriod(period) {
    this.pushState(this.state.queries, period, this.state.mode);
  }

  onChangeMode(mode) {
    this.pushState(this.state.queries, this.state.period, mode);
  }

  pushState(queries, period, mode) {
    this.context.router.push({
      pathname: "/trend",
      query: {
        query: queries.map(query => query.value),
        unit: period.unit,
        period: period.period,
        mode: mode,
      },
    });
  }

  fetchItemCounts(queries, period) {

    this.setState({loading: true});

    return new Promise((resolve, reject) => {
      request
        .get("/api/itemcounts/")
        .withCredentials()
        .query({
          query: queries.map(q => q.value),
          unit: period.unit,
          period: period.period,
        })
        .query({ query: "" })
        .end((err, res) => {
          if (err) {
            reject({
              statusCode: res.statusCode,
              statusText: res.statusText,
              detail: res.body.detail || null
            });
          } else {
            resolve(res.body);
          }
          this.setState({loading: false});
        });
    }).then(result => console.table(result))
      .catch(result => console.error(result));
  }


}
