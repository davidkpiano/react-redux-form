import React from 'react';
import { connect } from 'react-redux';
import { Field, actions } from 'redux-simple-form';

import Recipe from '../components/recipe-component';

const code = `
import { Field, actions } from 'redux-simple-form';

class OrderForm extends React.Component {
  handleAutofill() {
    let { dispatch, order } = this.props;

    dispatch(actions.change('order.shipping', order.billing));
  }

  render() {
    let { order } = this.props;

    return (
      <form>
        <h2>Billing Address</h2>

        <Field model="order.billing.address">
          <label>Address</label>
          <input type="text" value={order.billing.address}/>
        </Field>

        <Field model="order.billing.city">
          <label>City</label>
          <input type="text" value={order.billing.city} />
        </Field>

        <Field model="order.billing.state">
          <label>State</label>
          <input type="text" value={order.billing.state} />
        </Field>

        <Field model="order.billing.zip">
          <label>Zip Code</label>
          <input type="text" value={order.billing.zip} />
        </Field>

        <h2>Shipping Address</h2>

        <button type="button" onClick={() => this.handleAutofill()}>
          Autofill from Billing Address
        </button>

        <Field model="order.shipping.address">
          <label>Address</label>
          <input type="text" value={order.shipping.address}/>
        </Field>

        <Field model="order.shipping.city">
          <label>City</label>
          <input type="text" value={order.shipping.city} />
        </Field>

        <Field model="order.shipping.state">
          <label>State</label>
          <input type="text" value={order.shipping.state} />
        </Field>

        <Field model="order.shipping.zip">
          <label>Zip Code</label>
          <input type="text" value={order.shipping.zip} />
        </Field>
      </Recipe>
    );
  }
}
`;

class AutofillRecipe extends React.Component {
  handleAutofill() {
    let { dispatch, order } = this.props;

    dispatch(actions.change('order.shipping', order.billing));
  }

  render() {
    let { order } = this.props;

    return (
      <Recipe model="order" code={code}>
        <h1>Autofill Recipe</h1>
        <h2>Billing Address</h2>

        <Field model="order.billing.address">
          <label>Address</label>
          <input type="text" value={order.billing.address}/>
        </Field>

        <Field model="order.billing.city">
          <label>City</label>
          <input type="text" value={order.billing.city} />
        </Field>

        <Field model="order.billing.state">
          <label>State</label>
          <input type="text" value={order.billing.state} />
        </Field>

        <Field model="order.billing.zip">
          <label>Zip Code</label>
          <input type="text" value={order.billing.zip} />
        </Field>

        <h2>Shipping Address</h2>

        <button type="button" onClick={() => this.handleAutofill()}>
          Autofill from Billing Address
        </button>

        <Field model="order.shipping.address">
          <label>Address</label>
          <input type="text" value={order.shipping.address}/>
        </Field>

        <Field model="order.shipping.city">
          <label>City</label>
          <input type="text" value={order.shipping.city} />
        </Field>

        <Field model="order.shipping.state">
          <label>State</label>
          <input type="text" value={order.shipping.state} />
        </Field>

        <Field model="order.shipping.zip">
          <label>Zip Code</label>
          <input type="text" value={order.shipping.zip} />
        </Field>
      </Recipe>
    );
  }
}

export default connect(s => s)(AutofillRecipe);
