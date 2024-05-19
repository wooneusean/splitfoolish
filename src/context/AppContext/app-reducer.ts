import { ImmerReducer } from 'use-immer';
import { AppReducerAction, AppReducerState, IItem, IPerson } from '../../interfaces/app-reducer.ts';

export const appReducer: ImmerReducer<AppReducerState, AppReducerAction> = (draft, action) => {
  switch (action.type) {
    case 'ADD_PERSON':
      draft.people.push({ name: action.payload, owings: [] } as IPerson);
      break;

    case 'ADD_ITEM':
      draft.items.push(action.payload);
      break;

    case 'SPLIT':
      /**
       * Item -> Paid by [a] or [a, b, c]
       * Item -> split amongst all, all pay payer (payer owes 0), payer pays for all (no one owes payer)
       *
       * for each item
       *    for each [item.participants, item.paidBy] as participant
       *        participant.owes = item.split(participant)
       *    end for
       * end for
       */

      draft.items.forEach((item) => {
        // Clear owings
        draft.owings.length = 0;

        switch (item.strategy) {
          case 'equally':
            item.participants.forEach((p) => {
              const existingOwing = draft.owings.find(
                (po) => p.name === po.debtor.name && item.payer.name === po.creditor.name
              );

              if (existingOwing) {
                existingOwing.amount += item.cost / item.participants.length;
              } else {
                draft.owings.push({
                  amount: item.cost / item.participants.length,
                  debtor: p,
                  creditor: item.payer,
                });
              }
            });

            break;
          case 'owingPayer':
            break;
          case 'payerCovers':
            break;
        }
      });
      break;

    default:
      throw new Error(`Unsupported action type '${action.type}'`);
  }
};
