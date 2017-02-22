import React, { Component } from "react";

import QueryField from "../QueryField";
import QueryChip from "../QueryChip";
import { COLORS } from "../../colors";

class Trend extends Component {
  render() {
    return (
      <div>
        <div className="App-form-container">
          <QueryField onSubmit={this.props.onAddQuery}/>
        </div>
        <div className="App-queries-container" style={{}}>
          {this.props.queries.map((q, i) => (
            <QueryChip key={i}
                       query={q}
                       color={COLORS(i)}
                       onRequestDelete={this.props.onRemoveQuery}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default Trend;
