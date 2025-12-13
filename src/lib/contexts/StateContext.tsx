/**
 * State Context
 * Centralized state management for contract operations
 */

'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from 'react';

// Define the state shape
export interface ContractState {
  originalContract: string | null;
  simplifiedContract: string | null;
  revisedContract: string | null;
  isLoading: boolean;
  error: string | null;
}

// Define action types
export type ContractAction =
  | { type: 'SET_ORIGINAL_CONTRACT'; payload: string }
  | { type: 'SET_SIMPLIFIED_CONTRACT'; payload: string }
  | { type: 'SET_REVISED_CONTRACT'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' }
  | { type: 'RESTORE_STATE'; payload: ContractState };

// Storage key for localStorage
const STORAGE_KEY = 'trackrights_contract_state';

// Function to load state from localStorage
const loadStateFromStorage = (): ContractState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only restore if we have meaningful data
      if (
        parsed.originalContract ||
        parsed.simplifiedContract ||
        parsed.revisedContract
      ) {
        return {
          originalContract: parsed.originalContract || null,
          simplifiedContract: parsed.simplifiedContract || null,
          revisedContract: parsed.revisedContract || null,
          isLoading: false, // Always reset loading state
          error: null, // Always reset error state
        };
      }
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return null;
};

// Function to save state to localStorage
const saveStateToStorage = (state: ContractState): void => {
  if (typeof window === 'undefined') return;

  try {
    // Only save meaningful data (don't save loading/error states)
    const stateToSave = {
      originalContract: state.originalContract,
      simplifiedContract: state.simplifiedContract,
      revisedContract: state.revisedContract,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

// Create the initial state (empty, will be hydrated from localStorage)
const initialState: ContractState = {
  originalContract: null,
  simplifiedContract: null,
  revisedContract: null,
  isLoading: false,
  error: null,
};

// Create the reducer function
const reducer = (
  state: ContractState,
  action: ContractAction
): ContractState => {
  let newState: ContractState;

  switch (action.type) {
    case 'SET_ORIGINAL_CONTRACT':
      newState = { ...state, originalContract: action.payload };
      break;
    case 'SET_SIMPLIFIED_CONTRACT':
      newState = { ...state, simplifiedContract: action.payload };
      break;
    case 'SET_REVISED_CONTRACT':
      newState = { ...state, revisedContract: action.payload };
      break;
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload };
      break;
    case 'SET_ERROR':
      newState = { ...state, error: action.payload };
      break;
    case 'RESET_STATE':
      newState = {
        originalContract: null,
        simplifiedContract: null,
        revisedContract: null,
        isLoading: false,
        error: null,
      };
      // Clear localStorage on reset
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      break;
    case 'RESTORE_STATE':
      newState = action.payload;
      break;
    default:
      return state;
  }

  // Save to localStorage after each state change (except loading/error)
  if (action.type !== 'SET_LOADING' && action.type !== 'SET_ERROR') {
    saveStateToStorage(newState);
  }

  return newState;
};

// Create the context
interface StateContextType {
  state: ContractState;
  dispatch: React.Dispatch<ContractAction>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

// Create the provider component
export const StateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Restore state from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = loadStateFromStorage();
    if (stored) {
      dispatch({ type: 'RESTORE_STATE', payload: stored });
    }
  }, []);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

// Create a custom hook to use the state
export const useAppState = (): StateContextType => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
