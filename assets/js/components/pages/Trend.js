import React, { Component } from "react";

class Trend extends Component {
  render() {
    return (
      <div>
        <div>Trend</div>
        <div>{ this.props.queries }</div>
      </div>
    );
  }
}

export default Trend;
