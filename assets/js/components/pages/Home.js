import React, { Component } from "react";
import { Paper, TextField } from "material-ui";
import muiThemeable from 'material-ui/styles/muiThemeable';

import QueryField from "../QueryField";

class Home extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  render() {

    const styles = {
      paper1: {
        width: "100%",
        paddingTop: 16,
        paddingBottom: 64,
        backgroundColor: this.props.muiTheme.palette.primary1Color,
        color: this.props.muiTheme.palette.alternateTextColor,
      },
      paper2: {
        width: "100%",
        paddingTop: 16,
      },
      h1: {
        fontSize: 64,
        fontFamily: "serif",
      },
      h2: {
        fontSize: 18,
      },
      tagline: {
        textAlign: 'center',
      },
      search: {
        color: this.props.muiTheme.palette.alternateTextColor,
      },
      searchIcon: {
        marginRight: 16,
        color: this.props.muiTheme.palette.alternateTextColor,
      }
    };

    const searchFieldProps = {
      autoFocus: true,
      inputStyle: {
        color: this.props.muiTheme.palette.alternateTextColor,
      },
      underlineStyle: {
        color: this.props.muiTheme.palette.primary2Color,
      },
      underlineFocusStyle: {
        color: this.props.muiTheme.palette.alternateTextColor,
      },
    };

    return (
      <div>
        <Paper style={styles.paper1}>
          <div style={styles.tagline}>
            <h1 style={styles.h1}>QiiTrend</h1>
            <h2 style={styles.h2}>QiiTrendは、Qiitaの投稿件数の推移を時系列チャートで表示するサービスです。</h2>
            <div>チャートに表示したい投稿の検索クエリーを入力してください。</div>
            <QueryField showIcon={true}
                        iconProps={{style: styles.searchIcon}}
                        textFieldProps={searchFieldProps}
                        onSubmit={this.props.onAddQuery}
            />
            <div>例) 「tag:python」 「tag:go or tag:golang」 「scocks:>=100」 </div>
            <div>検索方法は、Qiitaの検索と同じです。詳細はこちらを参照してください。</div>
          </div>
        </Paper>
      </div>
    );
  }
}

export default muiThemeable()(Home);
