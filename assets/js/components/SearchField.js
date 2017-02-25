import React, { Component } from "react";
import { TextField, FlatButton } from "material-ui";
import muiThemeable from 'material-ui/styles/muiThemeable';
import SearchAction from 'material-ui/svg-icons/action/search';


class SearchField extends Component {

  state = {
    value: ""
  };

  handleChange(event, value) {
    this.setState({value});
  }

  handleKeyDown(event) {
    if (event.keyCode == 13) {
      const value = this.state.value;
      this.props.onSubmit(value);
    }
  }

  handleClick() {
    const value = this.state.value;
    this.props.onSubmit(value);
  }

  render() {
    const icon = (
      <SearchAction style={{marginBottom: 6}}
                    color={this.props.muiTheme.palette.alternateTextColor}/>
    );
    return (
      <div style={{position: "relative"}}>
        <TextField name="q"
                   value={this.state.value}
                   underlineShow={false}
                   autoFocus={true}
                   onChange={this.handleChange.bind(this)}
                   onKeyDown={this.handleKeyDown.bind(this)}
                   style={{
                     width: 200,
                     height: 32,
                     marginTop: 5,
                     borderTopLeftRadius: 16,
                     borderBottomLeftRadius: 16,
                     backgroundColor: "#fff",
                     overflow: "hidden",
                   }}
                   inputStyle={{ marginLeft: 16}}

        />
        <FlatButton icon={icon}
                    onClick={this.handleClick.bind(this)}
                    backgroundColor={this.props.muiTheme.palette.accent1Color}
                    style={{
                      minWidth: 32,
                      height: 32,
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      margin: "auto",
                      borderTopRightRadius: 16,
                      borderBottomRightRadius: 16,
                    }}
        />
      </div>
    );
  }
}

export default muiThemeable()(SearchField);
