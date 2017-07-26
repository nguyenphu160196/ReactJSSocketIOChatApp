import redux from 'redux';

const defaultState = {};
const reducer = (state = defaultState, action)=>{
	return state;
} 

const store = redux.createStore(reducer);

console.log(store.getState());

store.dispatch({});

console.log(store.getState());
