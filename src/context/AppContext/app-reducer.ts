import { WritableDraft } from 'immer';
import { ImmerReducer } from 'use-immer';
import {
  AppReducerAction,
  AppReducerState,
  IOwing,
  IPerson,
} from '../../interfaces/app-reducer.ts';

export const appReducer: ImmerReducer<AppReducerState, AppReducerAction> = (draft, action) => {
  switch (action.type) {
    case 'ADD_PERSON':
      draft.people.push({ name: action.payload, owings: [] } as IPerson);
      break;
    case 'REMOVE_PERSON':
      const indexToRemove = draft.people.findIndex((p) => p.name === action.payload);

      if (indexToRemove === -1) return;

      draft.people.splice(indexToRemove, 1);
      break;

    case 'ADD_ITEM':
      draft.items.push(action.payload);

      draft.owings = calculateOwings(draft);
      break;

    case 'REMOVE_ITEM':
      draft.items.splice(action.payload, 1);

      draft.owings = calculateOwings(draft);
      break;

    case 'SETTLE':
      draft.owings = calculateOwings(draft);
      break;

    case 'LOAD_TEST_DATA':
      draft.people = [
        {
          name: 'Sean',
        },
        {
          name: 'Fei',
        },
        {
          name: 'Joshua',
        },
        {
          name: 'Naquib',
        },
        {
          name: 'Ghuf',
        },
      ];

      draft.items = [
        {
          cost: 48,
          name: 'Golf Balls',
          payer: draft.people[0],
          participants: [...draft.people],
        },
        {
          cost: 48,
          name: 'Golf Balls',
          payer: draft.people[1],
          participants: [...draft.people],
        },
        {
          cost: 16,
          name: 'Golf Balls',
          payer: draft.people[2],
          participants: [draft.people[2], draft.people[3]],
        },
        {
          cost: 4,
          name: 'Water 1.5L',
          payer: draft.people[0],
          participants: [draft.people[1]],
        },
      ];

      draft.owings = calculateOwings(draft);
      break;

    default:
      throw new Error(`Unsupported action type '${action.type}'`);
  }
};

function calculateOwings(draft: WritableDraft<AppReducerState>): WritableDraft<IOwing>[] {
  // clear previous owings
  draft.owings.length = 0;

  for (let i = 0; i < draft.items.length; i++) {
    const item = draft.items[i];

    const pricePerPerson = item.cost / item.participants.length;

    item.participants.forEach((p) => {
      const existingOwing = draft.owings.find(
        (o) => p.name === o.payer.name && item.payer.name === o.payee.name
      );

      if (existingOwing != null) {
        existingOwing.amount += pricePerPerson;
      } else {
        draft.owings.push({
          amount: pricePerPerson,
          payer: p,
          payee: item.payer,
        });
      }
    });
  }

  return draft.owings;
}
