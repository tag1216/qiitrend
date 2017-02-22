import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';


export default class PeriodField extends Component {

  handleChange(evnet, index, period) {
    this.props.onChange(period);
  }

  render() {
    return (
      <SelectField
        value={this.props.value}
        onChange={this.handleChange.bind(this)}
      >
        {this.props.items.map((e, i) => (
          <MenuItem key={i} value={e} primaryText={e.label} />
        ))}
      </SelectField>
    );
  }
}
