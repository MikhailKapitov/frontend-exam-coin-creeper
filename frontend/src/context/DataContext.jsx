import React, { createContext, useReducer, useEffect, useContext, useRef } from 'react';
import { loadData, saveData, login as apiLogin, register as apiRegister } from '../api';

const StateContext = createContext();
const DispatchContext = createContext();

const initialState = {
  token: localStorage.getItem('token'),
  balance: 0,
  transactions: [],
  tags: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_TOKEN':
      return { ...state, token: action.token, error: null };
    case 'LOGOUT':
      return { ...initialState, token: null };
    case 'LOAD_START':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        balance: action.data.balance ?? 0,
        transactions: action.data.transactions ?? [],
        tags: action.data.tags ?? [],
      };
    case 'LOAD_ERROR':
      return { ...state, loading: false, error: action.error };
    case 'UPDATE_ALL':
      return { ...state, ...action.data };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
    }
  }, [state.token]);

  useEffect(() => {
    if (!state.token) return;
    console.log('[DataContext] ▶️  Loading data for token:', state.token);
    dispatch({ type: 'LOAD_START' });
    loadData(state.token)
      .then(data => {
        console.log('[DataContext] ✅  Loaded data:', data);
        dispatch({ type: 'LOAD_SUCCESS', data });
        hasLoadedOnce.current = true;
      })
      .catch(err => {
        console.error('[DataContext] ❌  Load error:', err);
        dispatch({ type: 'LOAD_ERROR', error: err.message });
        dispatch({ type: 'LOGOUT' });
      });
  }, [state.token]);

  useEffect(() => {
    if (!state.token || !hasLoadedOnce.current) return;
    const { token, loading, error, ...toSave } = state;
    console.log('[DataContext] 💾 Saving data:', toSave);
    saveData(state.token, toSave)
      .then(() => console.log('[DataContext] ✔️  Save successful'))
      .catch(err => console.error('[DataContext] ❌  Save error:', err));
  }, [state.token, state.balance, state.transactions, state.tags]);

  const login = async creds => {
    const { token } = await apiLogin(creds);
    dispatch({ type: 'SET_TOKEN', token });
  };

  const register = async creds => {
    const { token } = await apiRegister(creds);
    dispatch({ type: 'SET_TOKEN', token });
  };

  const logout = () => {
    hasLoadedOnce.current = false;
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <StateContext.Provider value={{ ...state, login, register, logout }}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export const useDataState = () => useContext(StateContext);
export const useDataDispatch = () => useContext(DispatchContext);
