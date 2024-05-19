export interface IOwing {
  payer: IPerson;
  payee: IPerson;
  amount: number;
}

export interface IPerson {
  name: string;
}

export interface IItem {
  name: string;
  cost: number;
  payer: IPerson;
  participants: IPerson[];
}

export interface AppReducerState {
  people: IPerson[];
  items: IItem[];
  owings: IOwing[];
}

export interface AppReducerAction {
  type: string;
  payload: any;
}
