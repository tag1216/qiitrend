import React, { Component } from "react";
import { Paper } from "material-ui";
import muiThemeable from 'material-ui/styles/muiThemeable';

import SearchField from "../SearchField";

import { TextField } from "material-ui";

class Home extends Component {

  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  render() {

    const styles = {
      paper: {
        width: "100%",
        paddingTop: 16,
        paddingBottom: 64,
        backgroundColor: this.props.muiTheme.palette.primary1Color,
        color: this.props.muiTheme.palette.alternateTextColor,
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
        marginTop: 64,
      },
    };

    return (
      <div>
        <Paper style={styles.paper}>
          <div style={styles.tagline}>
            <h1 style={styles.h1}>QiiTrend</h1>
            <h2 style={styles.h2}>QiiTrendは、Qiitaの投稿件数を時系列チャートで表示するサービスです。</h2>
            <div style={styles.search}>
              <div>チャートに表示したい投稿の検索条件を入力してください。</div>
              <div className="Home-SearchField-container">
                <SearchField  onSubmit={this.props.onAddQuery}/>
              </div>
              <div>例) 「tag:python」 「tag:go or tag:golang」 「stocks:>=100」 </div>
              <div>
                検索方法は <a href="http://qiita.com/search" target="_blank">Qiita</a> と同じです。
                詳細は <a href="http://help.qiita.com/ja/articles/qiita-search-options" target="_blank">こちら</a> を参照してください。
              </div>
            </div>
          </div>
        </Paper>
      </div>
    );
  }
}

export default muiThemeable()(Home);
