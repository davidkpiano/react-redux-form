import React from 'react';
import { connect } from 'react-redux';
import get from 'lodash/object/get';
import Code from './code-component';

class Recipe extends React.Component {
  constructor() {
    super();

    this.state = {
      data: 'model' // or 'form'
    }
  }
  render() {
    let { name, children, model, code } = this.props;

    return (
      <div className="rsf-recipe">
        <form
          name={ name }
          className="rsf-content"
          onSubmit={this.props.onSubmit}>
            <h3>{ name }</h3>
            { children }
        </form>

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

        { code && <Code className="rsf-code" content={code} /> }
      </div>
    );
  }
}

export default connect(s => s)(Recipe);
