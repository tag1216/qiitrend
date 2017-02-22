import React, { propTypes } from "react";
import { Component } from "react";
import { AppBar } from "material-ui";


export default class Header extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  render() {
    const router = this.context.router;
    const isHome = router.isActive("/", true);

    const styles = {
      title: {
        cursor: "pointer"
      },
    };

    const appBarProps = {
      title: <span style={styles.title}>QiiTrend</span>,
      onTitleTouchTap: () => router.push("/"),
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
