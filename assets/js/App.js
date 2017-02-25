import React, { propTypes } from "react";
import { Component } from "react";
import ReactGA from "react-ga";
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
    loggedIn: false,
    user: null,
    queries: [],
    period: periodItems[3],
    mode: "count",
    loading: false,
    message: null,
    itemCounts: [],
  };

  componentWillMount() {
    this.checkAccount();
    this.mapParamsToState(this.props.location);
  }

  componentWillReceiveProps(nextProps) {
    this.mapParamsToState(nextProps.location);
  }

  checkAccount() {
    request
      .get("/api/accounts/profile/")
      .withCredentials()
      .end((err, res) => {
        if (err) {
          this.setState({loggedIn: false, user: null});
        } else {
          this.setState({loggedIn: true, user: res.body});
        }
      });
  }

  mapParamsToState(location) {
    const urlQuery = url.parse(location.search, true).query;
    console.log(urlQuery);
    const queries = (typeof urlQuery.query == "string" ? [urlQuery.query] :
                     !urlQuery.query ? [] :
                     urlQuery.query).map(value => this.strToQuery(value));

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
      onLogin: this.onLogin.bind(this),
      onLogout: this.onLogout.bind(this),
      onAddQuery: this.onAddQuery.bind(this),
      onRemoveQuery: this.onRemoveQuery.bind(this),
      onChangePeriod: this.onChangePeriod.bind(this),
      onChangeMode: this.onChangeMode.bind(this),
      onMessageDialogClose: this.onMessageDialogClose.bind(this),
    };

    return (
      <div>
        <Header {...childProps}/>
        <main>
          { this.props.children && React.cloneElement(this.props.children, childProps) }
        </main>
      </div>
    );
  }

  onLogin() {
    ReactGA.event({category: "user", action: "Login"});
    location.href = "/api/accounts/login/";
  }

  onLogout() {
    ReactGA.event({category: "user", action: "Logout"});
    location.href = "/api/accounts/logout/";
  }

  onAddQuery(query) {
    const queries = this.state.queries.concat([this.strToQuery(query)]);
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

  strToQuery(query) {
    return {
      value: query,
      label: query === "" ? "(全投稿)" : query,
    }
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

  fetchItemCounts(queries, period, times = 5, interval = 2000, start = new Date().getTime()) {

    this.setState({loading: true});

    this.requestItemCounts(queries, period)
      .then(results => {

        if (results.some(r => r.count === null)) {

          if (times <= 1) {
            this.setState({
              loading: false,
              itemCounts: [],
              message: (
                <div>
                  <div>データの取得に時間が掛かっています。</div>
                  <div>しばらくしてから再読み込みしてください。</div>
                </div>
              )
            });
            ReactGA.timing({
              category: "itemcounts",
              variable: "Too Many Retry",
              value: new Date().getTime() - start
            });
          } else {
            wait(interval).then(() => this.fetchItemCounts(queries, period, times - 1, interval, start));
          }
        } else {
          this.setState({
            loading: false,
            itemCounts: results,
          });
          ReactGA.timing({
            category: "itemcounts",
            variable: "success",
            value: new Date().getTime() - start
          });
        }
      })
      .catch(results => {
        const {err, res} = results;
        this.setState({
          loading: false,
          itemCounts: [],
        });
        if (res && res.body && res.body.detail) {
          if (res.statusCode === 429) {
            const loginLink = this.state.loggedIn ? "" : (
                <div>
                  <a href="/api/accounts/login/"
                     onClick={() => {ReactGA.event({category: "login", action: "Too Many Requests"}); return true;}}>
                    Qiitaアカウントでログイン
                  </a>
                  すると制限が暖和されます。
                </div>
            );
            const retryAfter = res.headers["retry-after"];
            this.setState({
              message: (
                <div>
                  <div>リクエスト数制限を超過しました。</div>
                  <div>
                    {retryAfter < 60 ? retryAfter + "秒" : Math.floor(retryAfter / 60) + "分"}
                    以上待ってください。
                  </div>
                  { loginLink }
                </div>
              )
            });
            ReactGA.timing({
              category: "itemcounts",
              variable: "Too Many Requests",
              value: new Date().getTime() - start
            });
          } else {
            this.setState({
              message: (
                <div>
                  <div><span>{results.statusCode}</span><span>{results.statusText}</span></div>
                  <div>{results.detail}</div>
                </div>
              ),
            });
            ReactGA.timing({
              category: "itemcounts",
              variable: "Server Error",
              value: new Date().getTime() - start
            });
          }
        } else {
          this.setState({
            message: <div>サーバーに接続できませんでした。</div>,
          });
          ReactGA.timing({
            category: "itemcounts",
            variable: "Connection Error",
            value: new Date().getTime() - start
          });
        }
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
            reject({err, res});
          } else {
            resolve(res.body);
          }
        });
    });
  }
}

function wait(times) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(0)
    }, times);
  });
}
