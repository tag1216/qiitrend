import React, { propTypes } from "react";
import { Component } from "react";
import { AppBar } from "material-ui";


export default class App extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  render() {
    const router = this.context.router;
    const isHome = router.isActive("/", true);

    const appBarProps = {
      title: "QiiTrend",
    };

    if (isHome) {
      Object.assign(appBarProps, {
        title: "",
        zDepth: 0,
      });
    }

    return (
      <div>
        <header>
          <AppBar {...appBarProps}/>
        </header>
        <main>
          {this.props.children}
        </main>
      </div>
    );
  }
}