import React from "react";
import ReactDOM from "react-dom";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import injectTapEventPlugin from 'react-tap-event-plugin';
import ReactGA from "react-ga";
import url from "url";

import App from "./App"
import Home from "./components/pages/Home"
import Trend from "./components/pages/Trend"
import NotFound from "./components/pages/NotFound"

import muiTheme from "./mui-theme";

injectTapEventPlugin();

ReactGA.initialize(GA_TRACKING_ID);

function logPageView() {
  const path = url.format({
    pathname: location.pathname,
    search: location.search,
  });
  ReactGA.set({ page: path });
  ReactGA.pageview(path);
}

ReactDOM.render((
  <MuiThemeProvider muiTheme={muiTheme}>
    <Router history={browserHistory} onUpdate={logPageView}>
      <Route path="/" component={App}>
        <IndexRoute component={Home}/>
        <Route path="home" component={Home}/>
        <Route path="trend" component={Trend}/>
        <Route path="*" component={NotFound}/>
      </Route>
    </Router>
  </MuiThemeProvider>
), document.getElementById('react-app'));
