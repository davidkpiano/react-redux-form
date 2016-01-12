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
          <span
            className={`rsf-tab ${this.state.data === 'model' ? '-active' : ''}`}
            onClick={() => this.setState({data: 'model'})}>Model</span>
          { get(this.props, `${model}Form`) &&
            <span
              className={`rsf-tab ${this.state.data === 'form' ? '-active' : ''}`}
              onClick={() => this.setState({data: 'form'})}>Form</span>
          }
          <br />
          { this.state.data === 'model' && 
            <pre>{ JSON.stringify(get(this.props, model), null, 2) }</pre>
          }
          { this.state.data === 'form' && 
            <pre>{ JSON.stringify(get(this.props, `${model}Form`), null, 2) }</pre>
          }
        </div>

        { code && <Code className="rsf-code" content={code} /> }
      </div>
    );
  }
}

export default connect(s => s)(Recipe);
