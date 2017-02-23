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
    message: null,
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
      onMessageDialogClose: this.onMessageDialogClose.bind(this),
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

  onMessageDialogClose() {
    this.setState({
      message: null,
    });
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

  fetchItemCounts(queries, period, times = 5, interval = 2000) {

    this.setState({loading: true});

    this.requestItemCounts(queries, period)
      .then(results => {

        if (results.some(r => r.count === null)) {

          if (times <= 1) {
            console.log("しばらくお待ちください。");
            this.setState({
              loading: false,
              itemCounts: null,
              message: (
                <div>
                  <div>データの取得に時間が掛かっています。</div>
                  <div>しばらくしてから再読み込みしてください。</div>
                </div>
              )
            });
            return;
          }

          wait(interval).then(() => this.fetchItemCounts(queries, period, times - 1, interval));
          return;
        }

        this.setState({
          loading: false,
          itemCounts: results,
        });
      })
      .catch(results => {
        console.error(results);
        this.setState({
          loading: false,
          itemCounts: null,
          message: (
            <div>
              <div><span>{results.statusCode}</span><span>{results.statusText}</span></div>
              <div>{results.detail}</div>
            </div>
          ),
        });
      });

  }

  requestItemCounts(queries, period) {
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
        });
    });
  }

  setItemCounts(itemCounts) {
    console.table(itemCounts);
  }
}

function wait(times) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(0)
    }, times);
  });
}
