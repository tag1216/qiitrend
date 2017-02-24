import React, { Component } from "react";
import { TextField } from "material-ui";
import ActionSearch from 'material-ui/svg-icons/action/search';


class QueryField extends Component {

  static defaultProps = {
    textFieldProps: {
      name: "q",
      floatingLabelText: "検索クエリー",
      hintText: "例) tag:python",
    },
    value: "",
    onSubmit: () => {}
  };

  state = {
    state: this.props.value
  };


  constructor(props) {
    super(props);
    this.state.value = this.props.value;
  }

  handleChange(event, value) {
    this.setState({value});
  }

  handleKeyDown(event) {
    if (event.keyCode == 13) {
      const value = this.state.value;
      this.setState({value: ""});
      event.target.blur();
      this.props.onSubmit(value);
    }
  }

  render() {
    return (
      <div>
        { this.props.showIcon ? <ActionSearch {...this.props.iconProps}/> : "" }
        <TextField {...this.props.textFieldProps}
                   autoFocus="true"
                   value={this.state.value}
                   onChange={this.handleChange.bind(this)}
                   onKeyDown={this.handleKeyDown.bind(this)}>
        </TextField>
      </div>
    );
  }
}

export default QueryField;
