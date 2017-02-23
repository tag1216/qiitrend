import React, { Component } from 'react';
import { Dialog, FlatButton } from 'material-ui';

export default class MessageDialog extends Component {

  handleClose() {
    this.props.onClose();
  }

  render() {
    const open = this.props.message ? true : false;
    return (
      <Dialog modal={false}
              open={open}
              onRequestClose={this.handleClose.bind(this)}
              autoScrollBodyContent={true}
              actions={[
                <FlatButton label="閉じる" onTouchTap={this.handleClose.bind(this)}/>
              ]}
      >
        {this.props.message}
      </Dialog>
    );
  }
}