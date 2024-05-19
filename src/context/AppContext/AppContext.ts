import { createContext } from 'react';
import { AppReducerAction, AppReducerState } from '../../interfaces/app-reducer';

interface AppContextValue {
  state: AppReducerState;
  dispatch: React.Dispatch<AppReducerAction>;
}
export const AppContext = createContext<AppContextValue>({ state: () => {}, dispatch: () => {} });
