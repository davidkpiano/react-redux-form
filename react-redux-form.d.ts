// Type definitions for react-redux-form v1.0.8
// Project: https://github.com/davidkpiano/react-redux-form
// Definitions generated using: https://github.com/Microsoft/dts-gen

declare namespace ReactReduxForm {
    class Control {
        constructor(props: any, context: any);
        render(): any;
        shouldComponentUpdate(nextProps: any): any;
    }
    class Errors {
        constructor(props: any, context: any);
        render(): any;
        shouldComponentUpdate(nextProps: any): any;
    }
    class Field {
        constructor(props: any, context: any);
        render(): any;
        shouldComponentUpdate(nextProps: any): any;
    }
    class Fieldset {
        constructor(props: any, context: any);
        clearCache(): void;
        componentDidMount(): void;
        componentWillReceiveProps(nextProps: any): void;
        componentWillUnmount(): void;
        componentWillUpdate(): void;
        computeDispatchProps(store: any, props: any): any;
        computeStateProps(store: any, props: any): any;
        configureFinalMapDispatch(store: any, props: any): any;
        configureFinalMapState(store: any, props: any): any;
        getWrappedInstance(): any;
        handleChange(): void;
        isSubscribed(): any;
        render(): any;
        shouldComponentUpdate(): any;
        trySubscribe(): void;
        tryUnsubscribe(): void;
        updateDispatchPropsIfNeeded(): any;
        updateMergedPropsIfNeeded(): any;
        updateStatePropsIfNeeded(): any;
    }
    class Form {
        constructor(props: any, context: any);
        clearCache(): void;
        componentDidMount(): void;
        componentWillReceiveProps(nextProps: any): void;
        componentWillUnmount(): void;
        componentWillUpdate(): void;
        computeDispatchProps(store: any, props: any): any;
        computeStateProps(store: any, props: any): any;
        configureFinalMapDispatch(store: any, props: any): any;
        configureFinalMapState(store: any, props: any): any;
        getWrappedInstance(): any;
        handleChange(): void;
        isSubscribed(): any;
        render(): any;
        shouldComponentUpdate(): any;
        trySubscribe(): void;
        tryUnsubscribe(): void;
        updateDispatchPropsIfNeeded(): any;
        updateMergedPropsIfNeeded(): any;
        updateStatePropsIfNeeded(): any;
    }
    const actionTypes: {
        BATCH: string;
        BLUR: string;
        CHANGE: string;
        FOCUS: string;
        NULL: any;
        RESET: string;
        RESET_VALIDITY: string;
        SET_DIRTY: string;
        SET_ERRORS: string;
        SET_FIELDS_VALIDITY: string;
        SET_INITIAL: string;
        SET_PENDING: string;
        SET_PRISTINE: string;
        SET_SUBMITTED: string;
        SET_SUBMIT_FAILED: string;
        SET_TOUCHED: string;
        SET_UNTOUCHED: string;
        SET_VALIDATING: string;
        SET_VALIDITY: string;
        SET_VIEW_VALUE: string;
        VALIDATE: string;
    };
    const controls: {
        checkbox: {
            changeAction: any;
            checked: any;
            name: any;
            onBlur: any;
            onChange: any;
            onFocus: any;
            onKeyPress: any;
        };
        default: {
            name: any;
            onBlur: any;
            onChange: any;
            onFocus: any;
            onKeyPress: any;
            value: any;
        };
        file: {
            name: any;
            onBlur: any;
            onChange: any;
            onFocus: any;
            onKeyPress: any;
        };
        radio: {
            checked: any;
            name: any;
            onBlur: any;
            onChange: any;
            onFocus: any;
            onKeyPress: any;
            value: any;
        };
        reset: {
            onBlur: any;
            onClick: any;
            onFocus: any;
        };
        select: {
            name: any;
            onBlur: any;
            onChange: any;
            onFocus: any;
            onKeyPress: any;
            value: any;
        };
        text: {
            name: any;
            onBlur: any;
            onChange: any;
            onFocus: any;
            onKeyPress: any;
            value: any;
        };
        textarea: {
            name: any;
            onBlur: any;
            onChange: any;
            onFocus: any;
            onKeyPress: any;
            value: any;
        };
    };
    const initialFieldState: {
        errors: {
        };
        focus: boolean;
        pending: boolean;
        pristine: boolean;
        retouched: boolean;
        submitFailed: boolean;
        submitted: boolean;
        touched: boolean;
        valid: boolean;
        validated: boolean;
        validating: boolean;
        validity: {
        };
    };
    function batched(reducer: any, initialState: any, ...args: any[]): any;
    function combineForms(forms: any, ...args: any[]): any;
    function createFieldClass(...args: any[]): any;
    function createForms(forms: any, ...args: any[]): any;
    function form(formState: any): any;
    function formReducer(model: any, ...args: any[]): any;
    function getField(state: any, modelString: any): any;
    function getModel(object: any, path: any, defaultValue: any): any;
    function modelReducer(model: any, ...args: any[]): any;
    function modeled(reducer: any, model: any, ...args: any[]): any;
    function track(model: any, ...args: any[]): any;
    namespace Control {
        function checkbox(props: any): any;
        namespace contextTypes {
            function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
        function file(props: any): any;
        function input(props: any): any;
        namespace propTypes {
            function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
        function radio(props: any): any;
        function reset(props: any): any;
        function select(props: any): any;
        function text(props: any): any;
        function textarea(props: any): any;
    }
    namespace Errors {
        namespace contextTypes {
            function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
        namespace propTypes {
            function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
    }
    namespace Field {
        namespace contextTypes {
            function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
        namespace propTypes {
            function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
    }
    namespace Fieldset {
        class WrappedComponent {
            constructor(...args: any[]);
            getChildContext(): any;
            render(): any;
        }
        namespace WrappedComponent {
            namespace childContextTypes {
                function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
            }
            const defaultProps: {
                component: string;
            };
            namespace propTypes {
                function component(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
            }
        }
        namespace contextTypes {
            function store(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
        const displayName: string;
        namespace propTypes {
            function store(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
    }
    namespace Form {
        class WrappedComponent {
            constructor(props: any);
            attachNode(node: any): void;
            componentDidMount(): void;
            componentWillReceiveProps(nextProps: any): void;
            getChildContext(): any;
            handleInvalidSubmit(): void;
            handleReset(e: any): void;
            handleSubmit(e: any): any;
            handleValidSubmit(): any;
            render(): any;
            shouldComponentUpdate(nextProps: any): any;
            validate(nextProps: any, ...args: any[]): any;
        }
        namespace WrappedComponent {
            namespace childContextTypes {
                function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
            }
            const defaultProps: {
                component: string;
                validateOn: string;
            };
            namespace propTypes {
                function children(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function component(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function dispatch(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function errors(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function formValue(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function model(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function modelValue(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function onSubmit(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function validateOn(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
                function validators(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
            }
        }
        namespace contextTypes {
            function store(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
        const displayName: string;
        namespace propTypes {
            function store(p0: any, p1: any, p2: any, p3: any, p4: any, p5: any): any;
        }
    }
    namespace actions {
        function asyncSetValidity(model: any, ...args: any[]): any;
        function batch(model: any, ...args: any[]): any;
        function blur(model: any, ...args: any[]): any;
        function change(model: any, ...args: any[]): any;
        function filter(model: any, ...args: any[]): any;
        function focus(model: any, ...args: any[]): any;
        function load(model: any, ...args: any[]): any;
        function map(model: any, ...args: any[]): any;
        function merge(model: any, ...args: any[]): any;
        function move(model: any, ...args: any[]): any;
        function omit(model: any, ...args: any[]): any;
        function push(model: any, ...args: any[]): any;
        function remove(model: any, ...args: any[]): any;
        function reset(model: any, ...args: any[]): any;
        function resetErrors(model: any, ...args: any[]): any;
        function resetValidity(model: any, ...args: any[]): any;
        function setDirty(model: any, ...args: any[]): any;
        function setErrors(model: any, ...args: any[]): any;
        function setFieldsErrors(model: any, ...args: any[]): any;
        function setFieldsValidity(model: any, ...args: any[]): any;
        function setInitial(model: any, ...args: any[]): any;
        function setPending(model: any, ...args: any[]): any;
        function setPristine(model: any, ...args: any[]): any;
        function setSubmitFailed(model: any, ...args: any[]): any;
        function setSubmitted(model: any, ...args: any[]): any;
        function setTouched(model: any, ...args: any[]): any;
        function setUntouched(model: any, ...args: any[]): any;
        function setValidating(model: any, ...args: any[]): any;
        function setValidity(model: any, ...args: any[]): any;
        function submit(model: any, ...args: any[]): any;
        function submitFields(model: any, ...args: any[]): any;
        function toggle(model: any, ...args: any[]): any;
        function validSubmit(model: any, ...args: any[]): any;
        function validate(model: any, ...args: any[]): any;
        function validateErrors(model: any, ...args: any[]): any;
        function validateFields(model: any, ...args: any[]): any;
        function validateFieldsErrors(model: any, ...args: any[]): any;
        function xor(model: any, ...args: any[]): any;
    }
}
