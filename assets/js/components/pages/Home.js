import React, { Component } from "react";
import { Paper, TextField } from "material-ui";
import muiThemeable from 'material-ui/styles/muiThemeable';

import QueryField from "../QueryField";

class Home extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  handleQuerySubmit(query) {
    console.log(query);
    this.context.router.push(`/trend/?query=${query}`);
  }

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
      floatingLabelText: "検索クエリー",
      hintText: "例) tag:python",
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
            <QueryField iconProps={{style: styles.searchIcon}}
                        textFieldProps={searchFieldProps}
                        onSubmit={this.handleQuerySubmit.bind(this)}
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
