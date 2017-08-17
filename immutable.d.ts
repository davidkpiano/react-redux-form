import { ModelState } from "../react-redux-form";
/*
 * Action, Reducer, and Dispatch was taken from official redux libs
 * TODO: Remove them after TS 2.0 landing when /// <reference library="" /> will be available
 */
interface Action {
    type: any;
}
type Reducer<S> = <A extends Action>(state: S, action: A) => S;
export function modelReducer(model: string, initialState?: ModelState): Reducer<ModelState>;

export function modeled<TState>(reducer: Reducer<TState>, model: string): Reducer<TState>;
