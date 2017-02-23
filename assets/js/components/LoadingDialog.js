import React, { Component } from 'react';
import { Dialog, LinearProgress } from 'material-ui';

export default class LoadingDialog extends Component {
  render() {
    return (
      <Dialog title="Loading..."
              modal={true}
              open={this.props.open}
      >
        <LinearProgress/>
      </Dialog>
    );
  }
}