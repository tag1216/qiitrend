import React, { propTypes } from "react";
import { Component } from "react";
import { AppBar, FlatButton, IconMenu, IconButton, MenuItem, Avatar } from "material-ui";
import { OutboundLink } from "react-ga";


class Login extends Component {
  static muiName = 'FlatButton';

  render() {
    return (
      <FlatButton {...this.props} label="Qiitaアカウントでログイン" />
    );
  }
}

class Logged extends Component {
  static muiName = 'IconMenu';

  render() {
    return (
      <IconMenu
        {...this.props}
        iconButtonElement={
          <IconButton><Avatar size={24} src={this.props.user.profile_image_url} /></IconButton>
        }
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem containerElement={
          <OutboundLink eventLabel="send form"
                        to="https://ssl.form-mailer.jp/fms/d6036533496614"
                        target="_blank"
        />}
                  primaryText="ご意見・バグ報告" />
        <MenuItem value="logout" primaryText="ログアウト" />
      </IconMenu>
    );
  }
}

export default class Header extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  handleItemTouchTap(event, child) {
    if (child.props.value === "logout") {
      this.props.onLogout();
    }
  }

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
        <AppBar {...appBarProps}
                iconElementRight={
                  this.props.loggedIn
                    ? <Logged onItemTouchTap={this.handleItemTouchTap.bind(this)}
                              user={this.props.user}/>
                    : <Login onClick={this.props.onLogin} />}
        />
      </header>
    );
  }
}
