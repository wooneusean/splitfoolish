export interface IOwing {
  debtor: IPerson;
  creditor: IPerson;
  amount: number;
}

export interface IPerson {
  name: string;
}

export interface IItem {
  name: string;
  cost: number;
  payer: IPerson;
  strategy: 'equally' | 'owingPayer' | 'payerCovers';
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
