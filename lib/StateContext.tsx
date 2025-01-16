'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the state shape
interface State {
  originalContract: string | null;
  simplifiedContract: string | null;
  revisedContract: string | null;
  isLoading: boolean;
  error: string | null;
}

// Define action types
type Action =
  | { type: 'SET_ORIGINAL_CONTRACT'; payload: string }
  | { type: 'SET_SIMPLIFIED_CONTRACT'; payload: string }
  | { type: 'SET_REVISED_CONTRACT'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Create the initial state
const initialState: State = {
  originalContract: null,
  simplifiedContract: null,
  revisedContract: null,
  isLoading: false,
  error: null,
};

// Create the reducer function
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ORIGINAL_CONTRACT':
      return { ...state, originalContract: action.payload };
    case 'SET_SIMPLIFIED_CONTRACT':
      return { ...state, simplifiedContract: action.payload };
    case 'SET_REVISED_CONTRACT':
      return { ...state, revisedContract: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// Create the context
const StateContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

// Create the provider component
export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

// Create a custom hook to use the state
export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};

