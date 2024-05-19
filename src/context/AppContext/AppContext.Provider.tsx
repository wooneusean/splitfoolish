import { ReactNode } from 'react';
import { ImmerReducer, useImmerReducer } from 'use-immer';
import { AppReducerState, AppReducerAction } from '../../interfaces/app-reducer';
import { AppContext } from './AppContext';

interface AppProviderProps {
  children: ReactNode;
  reducer: ImmerReducer<AppReducerState, AppReducerAction>;
  initialState: AppReducerState;
}

export const AppContextProvider: React.FC<AppProviderProps> = ({
  children,
  initialState,
  reducer,
}) => {
  const [state, dispatch] = useImmerReducer(reducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}> {children} </AppContext.Provider>;
};
