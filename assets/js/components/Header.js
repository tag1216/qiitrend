import React, {propTypes, Component} from "react";
import {AppBar, IconMenu, IconButton, MenuItem, Avatar} from "material-ui";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import muiThemeable from "material-ui/styles/muiThemeable";
import {OutboundLink} from "react-ga";


class Profile extends Component {
  render() {
    return (
      <Avatar size={24} src={this.props.user.profile_image_url} />
    );
  }
}

class RightMenu extends Component {
  static muiName = "IconMenu";
  render() {
    const iconButton = <IconButton><MoreVertIcon/></IconButton>;
    const sendFormLink = (
      <OutboundLink eventLabel="send form"
                    to="https://ssl.form-mailer.jp/fms/d6036533496614"
                    target="_blank"
      />
    );
    const aboutLink = (
      <OutboundLink eventLabel="about"
                    to="http://qiita.com/tag1216/items/e65496b932ca6790268b"
                    target="_blank"
      />
    );
    const examplesLink = (
      <OutboundLink eventLabel="examples"
                    to="http://qiita.com/tag1216/items/ae2f197b211213410602"
                    target="_blank"
      />
    );

    const iconMenuProps = {
      iconStyle: this.props.iconStyle,
      onItemTouchTap: this.props.onItemTouchTap,
    };

    return (
      <IconMenu {...iconMenuProps}
                iconButtonElement={iconButton}>
        <MenuItem primaryText="QiiTrendについて" containerElement={aboutLink}/>
        <MenuItem primaryText="チャートの例" containerElement={examplesLink}/>
        <MenuItem primaryText="ご意見・バグ報告" containerElement={sendFormLink}/>
        {this.props.loggedIn
          ? <MenuItem value="logout" primaryText="ログアウト" />
          : <MenuItem value="login" primaryText="Qiitaアカウントでログイン" />
        }
      </IconMenu>
    );
  }
}

class Header extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  handleItemTouchTap(event, child) {
    switch (child.props.value) {
      case "logout":
        this.props.onLogout();
        break;
      case "login":
        this.props.onLogin();
        break;
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

    const title = (
      <span style={styles.title}
            onClick={() => router.push("/")}>
        QiiTrend
      </span>
    );

    const appBarProps = {
      showMenuIconButton: false,
      title,
      iconStyleRight: {

      },
    };

    if (isHome) {
      Object.assign(appBarProps, {
        title: "",
        zDepth: 0,
      });
    }

    const palette = this.props.muiTheme.palette;

    const profileProps = {
      ...this.props,
    };

    const rightMenuProps = {
      ...this.props,
      user: this.props.user,
      iconStyle: {
        color: palette.alternateTextColor,
      },
      onItemTouchTap: this.handleItemTouchTap.bind(this),
    };

    return (
      <header>
        <AppBar {...appBarProps}
                iconElementRight={
                  <div>
                    {this.props.loggedIn ? <Profile {...profileProps}/>: ""}
                    <RightMenu {...rightMenuProps}/>
                  </div>
                }
        >
        </AppBar>
      </header>
    );
  }
}

export default muiThemeable()(Header);
