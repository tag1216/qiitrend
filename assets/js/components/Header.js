import React, { propTypes } from "react";
import { Component } from "react";
import { AppBar } from "material-ui";


export default class Header extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    console.log("App()");
  }

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
      <header>
        <AppBar {...appBarProps}/>
      </header>
    );
  }
}
