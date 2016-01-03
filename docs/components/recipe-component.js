import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/object/get';

class Recipe extends React.Component {
  constructor() {
    super();

    this.state = {
      data: 'model' // or 'form'
    }
  }
  render() {
    let { name, children, model } = this.props;

    return (
      <form
        name={ name }
        className="rsf-recipe"
        onSubmit={this.props.onSubmit}>
        <div className="rsf-content">
          <h3>{ name }</h3>
          { children }
        </div>
        <div className="rsf-data">
          <span onClick={() => this.setState({data: 'model'})}>Model</span>
          { get(this.props, `${model}Form`) &&
            <span onClick={() => this.setState({data: 'form'})}>Form</span>
          }
          <br />
          { this.state.data === 'model' && [
            <strong>{ model } model:</strong>,
            <pre>{ JSON.stringify(get(this.props, model), null, 2) }</pre>
          ]}
          { this.state.data === 'form' && [
            <strong>{ model } form:</strong>,
            <pre>{ JSON.stringify(get(this.props, `${model}Form`), null, 2) }</pre>
          ]}
        </div>
      </form>
    );
  }
}

export default connect(s => s)(Recipe);
