// Type definitions for react-redux-form v0.13.4
// Project: https://github.com/davidkpiano/react-redux-form
// Definitions by: Robert Parker (Flavorus) <https://github.com/hsrobflavorus>, Flavorus <http://www.flavorus.com>, Alexey Svetliakov (@asvetliakov)

import * as React from 'react';

interface Action {
    type: any;
}
type Reducer<S> = <A extends Action>(state: S, action: A) => S;

interface AsyncValidatorFn {
    (val: any, done: Function): boolean;
}
interface AsyncValidators {
    [key: string]: AsyncValidatorFn;
}

interface ValidatorFn {
    (val: any): boolean;
}
interface Validators {
    [key: string]: ValidatorFn;
}
interface ValidityObject {
    [key: string]: boolean;
}

interface ErrorFn {
    (val: any): boolean | string;
}

interface ErrorValidators {
    [key: string]: ErrorFn;
}

interface ErrorsObject {
    [key: string]: boolean | string;
}
interface ErrorsMessageSelector {
    (val: any): string;
}
interface ErrorsComponentMessages {
    [key: string]: string | ErrorsMessageSelector;
}

interface FormValidators {
    [key: string]: Validators;
}
interface ValidationErrors {
    [key: string]: any;
}
/**
 * Internal interface
 */
interface FieldsObject<T> {
    [key: string]: T;
}

/**
 * Used for the <Errors> `show` prop
 */
interface FieldStatePredicate {
    (field: FieldState): boolean;
}

/**
 * A function that, when called with state, will return the first full model string (with the sub-model) that matches the predicate iteratee.
 */
interface ModelGetterFn {
    (state: any): string;
}

/**
 * Additional props when specifying a SFC Wrapper (ex. in <Errors>)
 */
interface WrapperProps {
    modelValue: any;
    fieldValue: FieldState;
}

/**
 * Additional props when specifying a SFC Custom Component (ex. in <Errors>)
 */
interface CustomComponentProps extends WrapperProps {
    children: any;
}

export interface FieldProps {
    /**
     * Wrap field into custom component
     */
    component?: React.ReactType;

	/**
	 * The string representing the store model value
	 * OR
	 * A function that, when called with state, will return the first full model string (with the sub-model) that matches the predicate iteratee.
	 */
    model: string | ModelGetterFn;
	/**
	 * If updateOn is a function, the function given will be called with the change action creator.
	 * The function given will be called in onChange.
	 *
	 * If a string, updateOn can be one of these values:
	 * * change - will dispatch in onChange
	 * * blur - will dispatch in onBlur
	 * * focus - will dispatch in onFocus
	 * @example
	 * import debounce from 'lodash/debounce';
	 * <Field model="test.bounce" updateOn={(change) => debounce(change, 1000)}>
	 *     <input type="text" />
	 * </Field>
	 */
    updateOn?: 'change' | 'blur' | 'focus';
	/**
	 * A map where the keys are validation keys, and the values are the corresponding functions that determine the validity of each key, given the model's value.
	 * Validator functions accept the value and return true if the field is valid.
	 */
    validators?: Validators;
	/**
	 * Indicates when to validate the field
	 *
	 * change - will dispatch in onChange
	 * blur - will dispatch in onBlur
	 * focus - will dispatch in onFocus
	 *
	 * @default change
	 */
    validateOn?: 'change' | 'blur' | 'focus';
    asyncValidators?: AsyncValidators;
	/**
	 * Indicates when to validate the field asynchronously
	 *
	 * change - will dispatch in onChange
	 * blur - will dispatch in onBlur
	 * focus - will dispatch in onFocus
	 *
	 * @default change
	 */
    asyncValidateOn?: 'change' | 'blur' | 'focus';
	/**
	 * An error validation object with key-errorValidator pairs.
	 * The inverse of `validators`.
	 */
    errors?: ValidationErrors | ErrorValidators;
	/**
	 * A function that parses the view value of the field before it is changed.
	 * @param value The view value that represents the next model value
	 * @param previous The current model value before it is changed
	 * @returns {typeof value} The parsed/processed value
	 */
    parser?: (value: any, previous?: any) => any;
	/**
	 * An action creator (function) that specifies which action the <Field> component should use when dispatching a change to the model.
	 *
	 * By default, this action is:
	 * * actions.change(model, value) for text input controls
	 * * actions.toggle(model, value) for checkboxes (single-value models)
	 * * actions.xor(model, value) for checkboxes (multi-value models)
	 *
	 * Notes:
	 * * Use changeAction to do any other custom actions whenever your value is to change.
	 * * Since changeAction expects an action creator and redux-thunk is used, you can asynchronously dispatch actions by returning a thunk.
	 *
	 * @param model The model that is being changed
	 * @param value The value that the model is being changed to
	 */
    changeAction?: (model: string, value: any) => void;
}

export class Field extends React.Component<FieldProps, {}> {

}

export interface FormProps {
	/**
	 * CSS Class Name(s)
	 */
    className?: string;
	/**
	 * The string representing the model of the form in the store.
	 * OR
	 * A function that, when called with state, will return the first full model string (with the sub-model) that matches the predicate iteratee.
	 *
	 * Typically, the <Field> components nested inside <Form> would be members of the form model;
	 * e.g. user.email and user.password are members of the user model.
	 */
    model: string | ModelGetterFn;
	/**
	 * An object representing the validators for the fields inside the form, where:
	 * * The keys are the field model names (e.g. 'email' for user.email)
	 * * The values are validator(s) for the field model. They can be:
	 * ** A validator function, which receives the field model value, or
	 * ** A validator object, with validation keys and validator functions as values, also receiving the field model value.
	 *
	 * If the key is the empty string ('': {...}), then the validator will belong to the form model itself.
	 * Validation will occur on any field model change by default, and only the validators for the fields that have changed will be run (as a performance enhancement)!
	 *
	 * Tips
	 * * Specifying validators on the form is usually sufficient - you don't need to put validators on the <Field> for most use cases.
	 * * If you need validators to run on submit, this is the place to put them.
	 */
    validators?: Validators | FormValidators;
	/**
	 * A string that indicates when validators or errors (for error validators) should run.
	 * By default, validators will only run whenever a field changes, and
	 * * Only for the field that has changed, and
	 * * Always for any form-wide validators.
	 *
	 * The possible values are:
	 * * change (Default): run validation whenever a field model value changes
	 * * submit: run validation only when submitting the form.
	 *
	 * Tips
	 * * Keep in mind, validation will always run initially, when the form is loaded.
	 * * If you want better performance, you can use validateOn="submit", depending on your use-case.
	 */
    validateOn?: 'change' | 'submit';
	/**
	 * The handler function called when the form is submitted. This works almost exactly like a normal <form onSubmit={...}> handler, with a few differences:
	 * * The submit event's default action is prevented by default, using event.preventDefault().
	 * * The onSubmit handler will not execute if the form is invalid.
	 * * The onSubmit handler receives the form model data, not the event.
	 *
	 * Tips:
	 * * You can do anything in onSubmit; including firing off custom actions or handling (async) validation yourself.
	 * @param formModelData The form's model data
	 */
    onSubmit?: (formModelData: any) => void;
	/**
	 * The component that the <Form> should be rendered to (default: "form".)
	 *
	 * * For React Native, it is important that you specify the component to avoid any rendering errors. For most use cases, component={View} will work.
	 */
    component?: React.ComponentClass<any> | string;
}
export class Form extends React.Component<FormProps, {}> { }

export interface ErrorsProps {
	/**
	 * The string representing the store model value
	 * OR
	 * A function that, when called with state, will return the first full model string (with the sub-model) that matches the predicate iteratee.
	 */
    model: string | ModelGetterFn;

	/**
	 * A plain object mapping where:
	 * * the keys are error keys (such as "required")
	 * * the values are either strings or functions.
	 * If the message value is a function, it will be called with the model value.
	 *
	 * Tips:
	 * * The messages prop is a great place to keep custom error messages that can vary based on the location in the UI, instead of hardcoding error messages in validation fuctions.
	 * * If a message is not provided for an error key, the message will default to the key value in the field .errors property.
	 *   * This means if you're using setErrors or the errors prop in <Field> to set error messages, they will automatically be shown in <Errors />.
	 */
    messages?: ErrorsComponentMessages;
	/**
	 * The show prop determines when error messages should be shown, based on the model's field state (determined by the form reducer).
	 * It can be a boolean, or a function, string, or object as a Lodash iteratee (https://lodash.com/docs#iteratee)
	 *
	 * Examples
	 * * show={true} will always show the errors if they exist
	 * * show={(field) => field.touched && !field.focus} will show errors if the model's field is touched and not focused
	 * * show={ {touched: true, focus: false} } same as above
	 * * show="touched" will show errors if the model's field is touched
	 *
	 * Tips
	 * * For the greatest amount of control, use show as a function.
	 * * Use show as a boolean if you want to calculate when an error should be shown based on external factors, such as form state.
	 * @see https://lodash.com/docs#iteratee
	 */
    show?: FieldState | FieldStatePredicate | boolean | string;
	/**
	 * The `wrapper` component, which is the component that wraps all errors, can be configured using this prop. Default: "div".
	 *
	 * Examples
	 * * wrapper="ul" will wrap all errors in an <ul>
	 * * wrapper={(props) => <div className="errors">{props.children}</div>} will render the specified functional component, with all the props from <Errors> and some computed props:
	 *   * modelValue - the current value of the model
	 *   * fieldValue - the current field state of the model
	 * * wrapper={CustomErrors} will wrap all errors in a <CustomErrors> component, which will receive the same props as above.
	 */
    wrapper?: string | React.StatelessComponent<ErrorsProps & WrapperProps> | React.ComponentClass<ErrorsProps & WrapperProps>;
	/**
	 * The `component`, which is the component for each error message, can be configured using this prop. Default: "span".
	 *
	 * Examples
	 * * component="li" will wrap all errors in a <li>
	 * * component={(props) => <div className="error">{props.children}</div>} will render the error message in the specified functional component, with these props:
	 *   * modelValue - the current value of the model
	 *   * fieldValue - the current field state of the model
	 *   * children - the error message (text).
	 * * component={CustomError} will wrap the error in a <CustomError> component, which will receive the same props as above.
	 */
    component?: string | React.StatelessComponent<ErrorsProps & CustomComponentProps> | React.ComponentClass<ErrorsProps & CustomComponentProps>;
}

export class Errors extends React.Component<ErrorsProps, {}> {

}

/**
 * Model state returned by model reducer
 */
export interface ModelState {
    [field: string]: any;
}

/**
 * Represents the state of a field returned by the Form Reducer
 */
interface _FieldState {
	/**
	 * @default true
	 */
    blur: boolean;
	/**
	 * @default false
	 */
    dirty: boolean;
	/**
	 * @default false
	 */
    focus: boolean;
    /**
     * @default any
     */
    initialValue: any;
	/**
	 * @default false
	 */
    pending: boolean;
	/**
	 * @default true
	 */
    pristine: boolean;
    /**
     * @default false
     */
    retouched: boolean;
	/**
	 * @default false
	 */
    submitted: boolean;
	/**
	 * @default false
	 */
    touched: boolean;
	/**
	 * @default true
	 */
    untouched: boolean;
	/**
	 * @default true
	 */
    valid: boolean;
	/**
	 * @default false
	 */
    validating: boolean;
	/**
	 * @default null
	 */
    viewValue: boolean;
	/**
	 * @default {}
	 */
    validity: any;
}

export interface FieldState extends _FieldState {
	/**
	 * Error object containing (key) validator name -> (value) boolean if is error (meaning INVALID is true)
	 * @default {}
	 */
    errors: any;
}


interface FieldStateT<TErrors extends ErrorsObject> extends _FieldState {
    errors: TErrors;
}

/**
 * Form state returned by form reducer
 */
export interface FormState {
	/**
	 * @deprecated Use the inverse of focus instead
	 */
    blur: boolean;
	/**
	 * @deprecated Use the inverse of pristine instead
	 */
    dirty: boolean;
    errors: ErrorsObject;
    fields: { [name: string]: FieldState };
    focus: boolean;
    model: string;
    pending: boolean;
    pristine: boolean;
    retouched: boolean;
    submitFailed: boolean;
    submitted: boolean;
    touched: boolean;
    valid: boolean;
    validating: boolean;
    validity: ValidityObject;
    viewValue: boolean;
}

/**
 * Returns a form reducer that only responds to any actions on the model or model's child values.
 * The reducer's state has the shape of initialFormState, with a fields property where each field has the shape of initialFieldState.
 * If provided an initialState, the form reducer will initialize its fields based on the initialState.
 *
 * Tips
 * * You might not need a form reducer if you don't care about field state (such as blur, focus, pristine, touched, etc.) or validation. If this is the case, don't create a form reducer. You'll save on performance costs.
 * * Fields in the form state can be accessed from <form>.fields, which is a flat object.
 * * E.g., the user.email model is retrieved from userForm.fields.email, whereas the user.phones[3].type model is retrieved from userForm.fields['phones.3.type'], and not userForms.fields.phones[3].type.
 * ** Why? For performance, simplicity, and integrity. If you have a model named user.focus or user.valid, you won't have any collisions with the flat <form>.fields[<field>] shape.
 * @param model The model whose form state (and child field states) the reducer will update
 * @param initialState The initial state of the model
 */
export function formReducer(model: string, initialState?: any): Reducer<FormState>;
/**
 * Returns the field from the formState calculated by the formReducer(s), if the field exists (has been initialized).
 * If the field doesn't exist, the initialFieldState is returned.
 * @param formState The form state as returned by the form reducer.
 * @param model The string model path to the field inside the form model, if it exists.
 */
export function getField(formState: FormState, model: string): FieldState;

interface PropMapping {
    [key: string]: Function;
}

interface FieldClassPropsMappings<P> {
    (props: P): PropMapping;
}

interface ComponentFieldClassPropsMappings<P> {
    [componentDisplayName: string]: FieldClassPropsMappings<P>;
}

/**
 * Create a custom <{SomeCustomControl}Field> wrapper component, given a dictionary of props mappings, where the key is the custom Component's `displayName` and the value is a props object mapping function.
 * @param propsMapping
 * @param defaultProps
 */
export function createFieldClass<P>(propsMapping: ComponentFieldClassPropsMappings<P>, defaultProps?: any): React.ComponentClass<FieldProps>;


interface ControlPropsMap {
    default: FieldClassPropsMappings<any>;
    checkbox: FieldClassPropsMappings<any>;
    radio: FieldClassPropsMappings<any>;
    select: FieldClassPropsMappings<any>;
    text: FieldClassPropsMappings<any>;
    textArea: FieldClassPropsMappings<any>;
}

export const controls: ControlPropsMap;

/**
 * Returns a model reducer that only responds to change() and reset() actions on the model or model's child values.
 *
 * Note: the model must be the same as the key given to the reducer in combineReducers({...}).
 * @param model The model that the reducer will update
 * @param initialState The initial state of the model
 */
export function modelReducer(model: string, initialState?: any): Reducer<any>;

/**
 * Decorates your existing reducer to respond to model actions
 */
export function modeled<TState>(reducer: Reducer<TState>, model: string): Reducer<TState>;


interface ActionThunk {
    (dispatch: (action: any) => void, getState: () => any): any;
}

interface BaseFormAction {
    type: string;
    model: string;
}
interface FieldAction extends BaseFormAction {
    errors?: any;
    validity?: any;
    pending?: boolean;
}

interface ModelAction extends BaseFormAction {
    multi?: boolean;
    value?: any;
}

interface ChangeOptions {
	/**
	 * If true, the CHANGE action will not trigger change-related operations in the form reducer, such as setting .pristine = false.
	 * @default false
	 */
    silent?: boolean;
}

interface ValidityOptions {
	/**
	 * If true, the validity will be set for .errors instead of .validity on the field. This is equivalent to actions.setErrors().
	 */
    errors?: boolean;
}

interface Actions {
    /* ------ ------ ------ ------ */
    /* ------ Model Actions ------ */
    /* ------ ------ ------ ------ */

	/**
	 * Returns an action that, when handled by a modelReducer, changes the value of the model to the value.
	 * When the change action is handled by a formReducer, the field model's .dirty state is set to true and its corresponding .pristine state is set to false.
	 *
	 * The model path can be as deep as you want. E.g. actions.change('user.phones[0].type', 'home')
	 *
	 * @param model
	 * @param value
	 */
    change: (model: string, value: any, options?: ChangeOptions) => ModelAction;

	/**
	 * Returns an action that, when handled by a modelReducer, changes the value of the model to the value.
	 * The load action is NOT handled by any formReducer. The field model's .dirty and .pristine states are NOT affected.
	 *
	 * This action is useful for loading the initial data set into the model store state, without affecting the form store state (i.e. not marking the form or any fields as touched/dirty).
	 *
	 * The model path can be as deep as you want. E.g. actions.change('user.phones[0].type', 'home')
	 *
	 * @param model
	 * @param value
	 */
    load: (model: string, value: any) => ModelAction;

	/**
	 * Returns an action that, when handled by a modelReducer, changes the value of the respective model to its initial value.
	 *
	 * This action will reset both the model value in the model reducer, and the model field state in the form reducer (if it exists).
	 * To reset just the field state (in the form reducer), use actions.setInitial(model).
	 */
    reset: (model: string) => ModelAction;
	/**
	 * Dispatches an actions.change(...) action that merges the values into the value specified by the model.
	 *
	 * Use this action to update multiple and/or deep properties into a model, if the model represents an object.
	 * This uses icepick.merge(modelValue, values) internally.
	 */
    merge: (model: string, values: any) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action that applies an "xor" operation to the array represented by the model; that is, it "toggles" an item in an array.
	 * If the model value contains item, it will be removed. If the model value doesn't contain item, it will be added.
	 *
	 * This action is most useful for toggling a checkboxes whose values represent items in a model's array.
	 * @param item the item to be "toggled" in the model value.
	 */
    xor: (model: string, item: any) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action that "pushes" the item to the array represented by the model.
	 *
	 * This action does not mutate the model. It only simulates the mutable .push() method.
	 */
    push: (model: string, item: any) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action that sets the model to true if it is falsey, and false if it is truthy.
	 *
	 * This action is most useful for single checkboxes.
	 */
    toggle: (model: string) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action that filters the array represented by the model through the iteratee function.
	 * If no iteratee is specified, the identity function is used by default.
	 * @param iteratee Filter iteratee function that filters the array represented by the model.
	 */
    filter: (model: string, iteratee: (value: any) => boolean) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action that maps the array represented by the model through the iteratee function.
	 * If no iteratee is specified, the identity function is used by default.
	 */
    map: (model: string, iteratee: Function) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action that removes the item at the specified index of the array represented by the model.
	 */
    remove: (model: string, index: number) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action that moves the item at the specified fromIndex of the array to the toIndex of the array represented by the model.
	 * If `fromIndex` or `toIndex` are out of bounds, an error will be thrown.
	 * @param model The array model to be updated.
	 * @param fromIndex The index of the item that should be moved in the array.
	 * @param toIndex The index to move the item to in the array.
	 */
    move: (model: string, fromIndex: number, toIndex: number) => ActionThunk;
	/**
	 * Dispatches an actions.change(...) action with the model value updated to not include any of the omitted props.
	 * @param model The model to be modified with the omitted props
	 * @param props The props to omit from the model value
	 */
    omit: (model: string, props: string | string[]) => ActionThunk;

    /* ------ ------ ------ ------ */
    /* ------ Field Actions ------ */
    /* ------ ------ ------ ------ */


	/**
	 * Returns an action that, when handled by a formReducer, changes the .focus state of the field model in the form to true, as well as the corresponding .blur state to false.
	 *
	 * The "focus" state indicates that the field model is the currently focused field in the form.
	 */
    focus: (model: string) => FieldAction;
	/**
	 * Returns an action that, when handled by a formReducer, changes the .blur state of the field model in the form to true, as well as the corresponding .focus state to false.
	 * It also indicates that the field model has been .touched, and will set that state to true and the untouched state to false.
	 *
	 * The "blur" state indicates that the field model is not focused.
	 */
    blur: (model: string) => FieldAction;
	/**
	 * Returns an action that, when handled by a formReducer, changes the .pristine state of the field model in the form to true, as well as the corresponding .dirty state to false.
	 *
	 * The "pristine" state indicates that the user has not interacted with this field model yet.
	 *
	 * Whenever a field is set to pristine, the entire form is set to:
	 * * Pristine if all other fields are pristine
	 * * Otherwise, dirty.
	 */
    setPristine: (model: string) => FieldAction;
	/**
	 * Returns an action that, when handled by a formReducer, changes the .dirty state of the field model in the form to true, as well as the corresponding .pristine state to false.
	 * The "dirty" state indicates that the model value has been changed.
	 *
	 * Whenever a field is set to dirty, the entire form is set to dirty.
	 */
    setDirty: (model: string) => FieldAction;
	/**
	 * Returns an action that, when handled by a formReducer, changes the .pending state of the field model in the form to true. It simultaneously sets the .submitted state to false.
	 *
	 * Tips:
	 * * This action is useful when asynchronously validating or submitting a model. It represents the state between the initial and final state of a field model's validation/submission.
	 */
    setPending: (model: string, pending?: boolean) => FieldAction;
	/**
	 * Returns an action that, when handled by a formReducer, changes the .touched state of the field model in the form to true. It simultaneously sets the .untouched state to false.
	 *
	 * The "touched" state indicates that this model has been interacted with.
	 *
	 * Tips:
	 * * Setting a model to touched also sets the entire form to touched.
	 * * Touched also sets the model to blurred.
	 */
    setTouched: (model: string) => FieldAction;
	/**
	 * Returns an action that, when handled by a formReducer, changes the .untouched state of the field model in the form to true. It simultaneously sets the .touched state to true.
	 *
	 * The "untouched" state indicates that this model has not been interacted with yet.
	 *
	 * Tips:
	 * * This action is useful for conditionally displaying error messages based on whether the field has been touched.
	 */
    setUntouched: (model: string) => FieldAction;
	/**
	 * Returns an action that, when handled by a formReducer, changes the .submitted state of the field model in the form to submitted (true or false).
	 * It simultaneously sets the .pending state to the inverse of submitted.
	 *
	 * The "submitted" state indicates that this model has been "sent off," or an action has been completed for the model.
	 *
	 * Tips:
	 * * Use the setPending() and setSubmitted() actions together to update the state of the field model during some async action.
	 */
    setSubmitted: (model: string, submitted?: boolean) => FieldAction;
    /**
     * Returns an action that, when handled by a formReducer, changes the .submitFailed state of the field model in the form to true.
     * It simultaneously sets the .pending state to false, and the .retouched state to false.
     * Tips:
     * * If the form has not been submitted yet, .submitFailed = false
     * * If submitting (pending), .submitFailed = false
     * * If submit failed, .submitFailed = true
     * * If resubmitting, .submitFailed = false again.
     */
    setSubmitFailed: (model: string) => FieldAction;

	/**
	 * Returns an action that, when handled by a formReducer, changes the state of the field model in the form to its initial state.
	 *
	 * Tips:
	 * * This action will reset the field state, but will not reset the model value in the model reducer. To reset both the field and model, use actions.reset(model).
	 */
    setInitial: (model: string) => FieldAction;

	/**
	 * Waits for a submission promise to be completed, then, if successful:
	 * * Sets .submitted property of form for model to true
	 * * Sets .validity property of form for model to the response (or true if the response is undefined).
	 *
	 * If the promise fails, the action will:
	 * * set .submitFailed property of form for model to true
	 * * set .errors property of form for model to the response
	 *
	 * @param model The top-level model form key of the data to submit.
	 * @param promise The promise that the submit action will wait to be resolved or rejected
	 */
    submit: (model: string, promise: Promise<any>) => ActionThunk;

    /* -------------------------------- */
    /* ------ Validation Actions ------ */
    /* -------------------------------- */

	/**
	 * Returns an action that, when handled by a formReducer, changes the .valid state of the field model in the form to true or false, based on the validity.
	 * It will also set the .validity state of the field model to the validity.
	 * It simultaneously sets the .errors on the field model to the inverse of the validity.
	 *
	 * Tips:
	 * * If you really want to set error messages instead, use actions.setErrors(model, errors).
	 * * Since arrays are objects, the validity argument can be an array. Only do this if your use case requires it.
	 *
	 * @param model The model whose validity will be set.
	 * @param validity Boolean value or an object indicating which validation keys of the field model are valid.
	 */
    setValidity: (model: string, validity: boolean | string | ValidityObject | ErrorsObject, options?: ValidityOptions) => FieldAction;

	/**
	 * Returns an action thunk that calculates the validity of the model based on the function/object validators. Then, the thunk dispatches actions.setValidity(model, validity).
	 *
	 * A validator is a function that returns true if valid, and false if invalid.
	 * @param model The model whose validity will be calculated.
	 * @param validators A validator function or an object whose keys are validation keys (such as 'required') and values are validators.
	 */
    validate: (model: string, validators: Function | Validators) => ActionThunk;

    /**
     * Explicit action created for validating fields of a form.
     * @param model The model to validate
     * @param fieldValidators an object where the keys are the field paths (such as "email" for user.email), and the values are validators (either functions or a validation object)
     * @param options Options
     */
    validateFields: (model: string, fieldValidators: FieldsObject<ValidatorFn | Validators>, options?: { onValid?: Function; onInvalid?: Function; errors?: any }) => ActionThunk;

    /**
     * Runs error validation on each of the error validators for each submodel of model
     * @param model The model to validate
     * @param fieldErrorsValidators An object where the keys are the field paths (such as "email" for user.email) and the values are errors
     * @param options Options
     */
    validateFieldsErrors: (model: string, fieldErrorsValidators: FieldsObject<ErrorFn | ErrorsObject>, options?: any) => ActionThunk;

    /**
     * This action allows you to set the validity for multiple submodels of a model at the same time.
     * @param model The top level form model
     * @param fieldsValidity An object where the keys are field paths and the value is validity object
     */
    setFieldsValidity: (model: string, fieldsValidity: FieldsObject<ValidityObject | boolean>) => FieldAction;

    /**
     * This action allows you to set the errors for multiple submodels of a model at the same time. Similar to setFieldsValidity but for errors
     * @param model The top level form model
     * @param fieldsErrors An object where the keys are field paths and the value is error object
     */
    setFieldsErrors: (model: string, fieldsErrors: FieldsObject<ErrorsObject | boolean | string>) => FieldAction;



	/**
	 * Returns an action thunk that calculates the validity of the model based on the async function asyncValidator.
	 * That function dispatches actions.setValidity(model, validity) by calling done(validity).
	 *
	 * Tips:
	 * * This action is useful for general-purpose asynchronous validation using callbacks. If you are using promises, using actions.submit(model, promise) is a cleaner pattern.
	 *
	 * @param model The model whose validity will be set
	 * @param asyncValidator A function that is given two arguments: value - the value of the model, done - the callback where the calculated validity is passed in as the argument.
	 */
    asyncSetValidity: (model: string, asyncValidator: AsyncValidatorFn) => ActionThunk;

	/**
	 * Returns an action that, when handled by a formReducer, changes the .valid state of the field model in the form to true or false, based on the errors.
	 * It will also set the .errors state of the field model to the errors.
	 *
	 * It simultaneously sets the .validity on the field model to the inverse of the errors.
	 *
	 * Tips:
	 * * If you aren't hard-coding error messages, use actions.setValidity(model, validity) instead. It's a cleaner pattern.
	 * * You can set errors to a boolean, object, array, string, etc. Remember: truthy values indicate errors.
	 *
	 * @param model
	 * @param errors A truthy/falsey value, a string error message, or an object indicating which error keys of the field model are invalid via booleans (where true is invalid) or strings (set specific error messages, not advised).
	 */
    setErrors: (model: string, errors: boolean | string | ErrorsObject) => FieldAction;

	/**
	 * Returns an action thunk that calculates the errors of the model based on the function/object errorValidators. Then, the thunk dispatches actions.setErrors(model, errors).
	 *
	 * An error validator is a function that returns true or a truthy value (such as a string) if invalid, and false if valid.
	 *
	 * Tips:
	 * * As previously stated, if you aren't using error messages, use actions.validate(model, validators) as a cleaner pattern.
	 * @param model
	 * @param errorValidators An error validator or an object whose keys are error keys (such as 'incorrect') and values are error validators.
	 */
    validateErrors: (model: string, errorValidators: ValidatorFn | Validators) => ActionThunk;

    /**
     * Can be dispatched to reset the validity and errors of any model at any time.
     * @param model The model
     */
    resetValidity: (model: string) => ActionThunk;
    /**
     * Can be dispatched to reset the validity and errors of any model at any time.
     * @param model The model
     */
    resetErrors: (model: string) => ActionThunk;


	/**
	 * Process multiple actions, which can be standard ModelAction/FieldAction or ActionThunks.
	 *
	 * If all actions are NOT thunks, will return a standard action of type `actionTypes.BATCH` which can then be dispatched.
	 *
	 * If some actions ARE thunks, will return a thunk which can then be dispatched.
	 *
	 * @param model
	 * @param actions An array of standard actions or thunk actions to combine into a new standard action or thunk, respectively.
	 */
    batch: (model: string, actions: any[]) => ActionThunk | ModelAction | FieldAction;
}

export const actions: Actions;

interface ActionTypes {
    BLUR: string;
    CHANGE: string;
    FOCUS: string;
    RESET: string;
    VALIDATE: string;
    SET_DIRTY: string;
    SET_ERRORS: string;
    SET_INITIAL: string;
    SET_PENDING: string;
    SET_PRISTINE: string;
    SET_SUBMITTED: string;
    SET_SUBMIT_FAILED: string;
    SET_TOUCHED: string;
    SET_UNTOUCHED: string;
    SET_VALIDITY: string;
    SET_FIELDS_VALIDITY: string;
    SET_VIEW_VALUE: string;
    RESET_VALIDITY: string;
    BATCH: string;
}

export var actionTypes: ActionTypes;

/**
 * You can create model getters using the track() function,
 * @param model the model that represents the collection and property you want to track
 * @param predicate Either a boolean filter predicate function OR a Lodash iteratee (https://lodash.com/docs#iteratee) that finds the correct model to track.
 * @see https://lodash.com/docs#iteratee     *
 * @example
 *   const team = {
 *       users: [
 *         { name: 'Alice' },
 *         { name: 'Bob' }
 *       ]
 *     };
 *     const isBob = (item) => item.name === 'Bob';
 *     track('users', isBob)(users);
 *     // => 'users.1'
 */
export function track(model: string, predicate: any): ModelGetterFn;
