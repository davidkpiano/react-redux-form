import React from 'react';
import {
  Field,
  Control,
  Form,
  actions,
  track,
} from 'react-redux-form';
import { connect } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
import get from 'lodash/get';

const controlMap = {
  text: <input type="text" />
};

const createField = () => ({
  id: uniqueId(),
  model: 'user.name',
  label: '',
  controls: [],
});

class FormBuilder extends React.Component {
  handleAddField() {
    const { dispatch } = this.props;

    const newField = createField();

    dispatch(actions.push('fields', newField));
    dispatch(actions.change('currentField', newField.id));
  }
  render() {
    const { fields, currentField, dispatch } = this.props;

    const editingField = fields.find((field) => field.id === currentField);

    return (
      <Form model="user">
        <button
          type="button"
          onClick={() => this.handleAddField()}
        >
          Add Field
        </button>
        {fields.map((field) =>
          <Field
            model={field.model}
            key={field.id}
            onClick={() => dispatch(actions.change('currentField', field.id))}
          >
            <label>{field.label}</label>
            {controlMap[field.type] || <input />}
          </Field>
        )}
        {currentField &&
          <fieldset>
            <strong>Editing {editingField.model} {currentField}</strong>
            <Field model={track('fields[].label', {id: currentField})} dynamic>
              <label>Label for {editingField.model} {currentField}</label>
              <input type="text" />
            </Field>
          </fieldset>
        }
      </Form>
    )
  }
}

export default connect(s => s)(FormBuilder);
