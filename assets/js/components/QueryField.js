import React, { Component } from "react";
import { TextField } from "material-ui";
import ActionSearch from 'material-ui/svg-icons/action/search';


class QueryField extends Component {

  static defaultProps = {
    value: "",
    onSubmit: () => {}
  }

  state = {
    state: this.props.value
  };


  constructor(props) {
    super(props);
    console.log(this.props)
    this.state.value = this.props.value;
  }

  handleChange(event, value) {
    this.setState({value});
  }

  handleKeyDown(event) {
    if (event.keyCode == 13) {
      const value = this.state.value;
      this.props.onSubmit(value);
    }
  }

  render() {
    return (
      <div>
        <ActionSearch {...this.props.iconProps}/>
        <TextField {...this.props.textFieldProps}
                   onChange={this.handleChange.bind(this)}
                   onKeyDown={this.handleKeyDown.bind(this)}>
        </TextField>
      </div>
    );
  }
}

export default QueryField;
