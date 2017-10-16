# Immutable.js

React Redux Form, as of the latest version, has support for Immutable.JS. To use it, just import the parts you need from `react-redux-form/immutable`:

```jsx
import Immutable from 'immutable';
import {
  Form,
  Control,
  actions,
  // ... etc.
} from 'react-redux-form/immutable';
// ... other imports

class MyForm extends Component {
  onFormSubmit(formObj) {
    // ... access form fields e.g. formObj.get('name');
  }
  render() {
    return (
      <Form model="user" onSubmit={this.onFormSubmit}>
        <Control model=".name" />
        
        {/* ... other controls */}
      </Form>
    );
  }
}

export default MyForm;
```

and it will _just work_ with Immutable.js. When creating your store, make sure to import `createForms`, `combineForms`, `modelReducer`, and/or `formReducer`, etc. from `react-redux-form/immutable`.
