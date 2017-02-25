import React, { Component } from 'react';
import { Avatar, Chip } from 'material-ui';

const styles = {
  chip: {
    margin: '0 4px 4px 0',
  },
};

export default class QueryChip extends Component {

  handleRequestDelete = () => { this.props.onRequestDelete(this.props.query) }

  render() {
    return (
      <Chip
        onRequestDelete={this.handleRequestDelete}
        style={styles.chip}
      >
        <Avatar backgroundColor={this.props.color}/>
        {this.props.query.label}
      </Chip>
    );
  }
}

