import React from 'react';
import { connect } from 'react-redux';
import { Field, actions } from 'redux-simple-form';
import debounce from 'lodash/function/debounce';

import Recipe from '../components/recipe-component';

const code = `
class InvoicesForm extends React.Component {
  render() {
    let { invoices, dispatch } = this.props;

    return (
      <form>
        <h2>Multiple Records</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
          { invoices.map((_, i) => 
            <tr key={i}>
              <td>
                <Field model={\`invoices[$\{i}].name\`}>
                  <input type="text" />
                </Field>
              </td>
              <td>
                <Field model={\`invoices[$\{i}].description\`}>
                  <input type="text" />
                </Field>
              </td>
              <td>
                <Field model={\`invoices[$\{i}].quantity\`}
                  parser={n => +n}>
                  <input type="text" />
                </Field>
              </td>
              <td>
                <Field model={\`invoices[$\{i}].price\`}
                  parser={n => +n}>
                  <input type="text" />
                </Field>
              </td>
            </tr>
          )}
          </tbody>
        </table>

        <button type="button"
          onClick={() => dispatch(actions.push('invoices', {}))}>
          Add new record
        </button>
      </form>
    );
  }
}
`

class MultiRecordRecipe extends React.Component {
  render() {
    let { multiRecord, dispatch } = this.props;

    return (
      <Recipe model="multiRecord" code={code}>
        <h2>Multiple Records</h2>
        <p>Click "Add New Record" to add more records. This is also a good stress test to see how Redux Simple Form performs with many fields!</p>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
          { multiRecord.map((record, i) => 
            <tr key={i}>
              <td>
                <Field model={`multiRecord[${i}].name`}>
                  <input type="text" />
                </Field>
              </td>
              <td>
                <Field model={`multiRecord[${i}].description`}>
                  <input type="text" />
                </Field>
              </td>
              <td>
                <Field model={`multiRecord[${i}].quantity`}
                  parser={a => +a}>
                  <input type="text" />
                </Field>
              </td>
              <td>
                <Field model={`multiRecord[${i}].price`}
                  parser={a => +a}>
                  <input type="text" />
                </Field>
              </td>
            </tr>
          )}
          </tbody>
        </table>
        <button type="button"
          onClick={() => dispatch(actions.push('multiRecord', {}))}>
          Add new record
        </button>
      </Recipe>
    );
  }
}

export default connect(s => s)(MultiRecordRecipe);
