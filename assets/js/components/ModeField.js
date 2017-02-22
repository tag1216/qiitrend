import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';


export default class ModeField extends Component {

  handleChange(event, index, value) {
    this.props.onChange(value);
  }

  render() {
    return (
      <SelectField
        value={this.props.value}
        onChange={this.handleChange.bind(this)}
      >
        <MenuItem value="count" primaryText="投稿数" />
        <MenuItem value="ratio" primaryText="全投稿数に対する割合" />
      </SelectField>
    );
  }
}
