// server.autosuggest.js
import React from 'react';
import Autosuggest from 'react-autosuggest';
import './autosuggest.css';

class ServerAutoSuggest extends React.Component {
  constructor(props) {
    super(props);

    //Define state for value and suggestion collection
    this.state = {
      id: props.id ? props.id : '',
      value: props.value ? props.value : '',
      suggestions: props.suggestionValue ? props.suggestionValue : [],
    };
  }

  // Filter logic
  getSuggestions = async value => {
    if (this.props.url) {
      const inputValue = value.trim().toLowerCase();
      let response = await fetch(this.props.url + '?s=' + inputValue);
      let data = await response.json();
      return data;
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.props.suggestionValue != prevProps.suggestionValue) {
      if (this.props.suggestionFromPropsOnly) {
        this.setState({ suggestions: this.props.suggestionValue });
      }
    }
  }

  // Trigger suggestions
  getSuggestionValue = suggestion => {
    this.setState({
      id: suggestion.id,
    });
    this.props.setAutosuggestId(suggestion.id, this.props.keyValue);
    this.props.onSelectVideo(suggestion);
    return suggestion.title;
  };

  // Render Each Option
  renderSuggestion = suggestion => (
    <span className="sugg-option">
      <span className="icon-wrap">
        <img
          src={
            (this.props.imageSuffix ? this.props.imageSuffix : '') +
            suggestion.image
          }
        />
      </span>
      <span className="name">{suggestion.title}</span>
    </span>
  );

  // OnChange event handler
  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue,
    });
  };

  // Suggestion rerender when user types
  onSuggestionsFetchRequested = ({ value }) => {
    if (this.props.fetchRequest) {
      this.props.fetchRequest(value);
    }
    if (this.props.url) {
      this.getSuggestions(value).then(data => {
        if (data.error) {
          this.setState({
            suggestions: [],
          });
        } else {
          this.setState({
            suggestions: data.result,
          });
        }
      });
    }
  };

  // Triggered on clear
  onSuggestionsClearRequested = () => {
    if (!this.props.unclear) {
      this.setState({
        suggestions: [],
      });
    }
  };

  render() {
    const { value, suggestions } = this.state;

    // Option props
    const inputProps = {
      placeholder: this.props.t(this.props.placeholder),
      value,
      onChange: this.onChange,
    };

    // Adding AutoSuggest component
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}

export default ServerAutoSuggest;
