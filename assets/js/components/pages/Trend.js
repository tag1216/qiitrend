import React, { Component } from "react";
import { Paper } from "material-ui";

import QueryField from "../QueryField";
import QueryChip from "../QueryChip";
import PeriodField from "../PeriodField";
import ModeField from "../ModeField";
import LoadingDialog from "../LoadingDialog";
import MessageDialog from "../MessageDialog";
import Chart from "../Chart";
import { COLORS } from "../../colors";

class Trend extends Component {
  render() {
    return (
      <div>
        <div className="App-form-container">
          <QueryField onSubmit={this.props.onAddQuery}/>
        </div>
        {this.props.queries.length === 0 || this.props.loading ? null : (
          <div className="App-chart-container">
            <div></div>
            <Paper className="App-chart-paper">
              <span className="App-option">
                <PeriodField items={this.props.periodItems}
                             value={this.props.period}
                             onChange={this.props.onChangePeriod}
                />
              </span>
              <span className="App-option">
                <ModeField value={this.props.mode}
                           onChange={this.props.onChangeMode}
                />
              </span>
              <div className="App-queries-container" style={{}}>
                {this.props.queries.map((q, i) => (
                  <QueryChip key={i}
                             query={q}
                             color={COLORS(i)}
                             onRequestDelete={this.props.onRemoveQuery}
                  />
                ))}
              </div>
              <div className="App-chart">
                <Chart queries={this.props.queries}
                       itemCounts={this.props.itemCounts}
                       mode={this.props.mode}
                />
              </div>
            </Paper>
          </div>
        )}
        <LoadingDialog open={this.props.loading} />
        <MessageDialog message={this.props.message}
                       onClose={this.props.onMessageDialogClose}
        />
      </div>
    );
  }
}

export default Trend;
