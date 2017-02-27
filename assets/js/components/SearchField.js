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
      <div style={{
        width: "100%",
        height: "100%",
        textAlign: "left",
        borderRadius: 16,
        backgroundColor: "#fff",
        overflow: "hidden",
      }}>
        <div style={{ position: "relative"}}>
          <TextField name="q"
                     value={this.state.value}
                     underlineShow={false}
                     autoFocus={true}
                     onChange={this.handleChange.bind(this)}
                     onKeyDown={this.handleKeyDown.bind(this)}
                     style={{
                       marginLeft: 16,
                       width: "calc(100% - 48px - 16px)",
                       height: 32,
                     }}
                     inputStyle={{
                     }}
          />
          <FlatButton icon={icon}
                      onClick={this.handleClick.bind(this)}
                      backgroundColor={this.props.muiTheme.palette.accent1Color}
                      style={{
                        minWidth: 48,
                        height: 32,
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        margin: "auto",
                        borderRadius: 0,
                      }}
          />
        </div>
      </div>
    );
  }
}

export default muiThemeable()(SearchField);
