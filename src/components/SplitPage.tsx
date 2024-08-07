import { ActionIcon, Button, List, Select, Title, Tooltip } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import Big from 'big.js';
import { produce } from 'immer';
import _ from 'lodash';
import { FormEvent, useContext, useEffect } from 'react';
import { useImmer } from 'use-immer';
import IconShare from '~icons/tabler/share';
import { AppContext } from '../context/AppContext/AppContext';
import { IOwing } from '../interfaces/app-reducer';
import ShareModal from './ShareModal';
import SplitTable from './SplitTable';

const SplitPage = () => {
  const { state } = useContext(AppContext);
  const [owings, setOwings] = useImmer(state.owings);
  const singlePayerForm = useForm({ mode: 'uncontrolled' });

  const optimizeOwings = (unoptimizedOwings: IOwing[]): IOwing[] => {
    if (unoptimizedOwings == null || unoptimizedOwings.length === 0) return unoptimizedOwings;

    const newOwings = produce(unoptimizedOwings, (draft) => {
      // Remove pay-to-self
      draft.splice(0, draft.length, ...draft.filter((o) => o.payee.name !== o.payer.name));

      // Consolidate owings
      {
        const newOwings: IOwing[] = [];
        const settledOwings: IOwing[] = [];
        const localOwing = _.cloneDeep(draft);
        localOwing.forEach((owing) => {
          if (settledOwings.includes(owing)) return;

          settledOwings.push(owing);

          const duplicates = localOwing.filter(
            (o) =>
              o !== owing && o.payee.name === owing.payee.name && o.payer.name === owing.payer.name,
          );

          settledOwings.push(...duplicates);

          const sumOfDuplicates = duplicates
            .reduce((sum, o) => sum.add(o.amount), Big(0))
            .toNumber();

          owing.amount += sumOfDuplicates;

          newOwings.push(owing);
        });

        draft.splice(0, draft.length, ...newOwings);
      }

      {
        // Settle counters
        const newOwings: IOwing[] = [];
        const settledOwings: IOwing[] = [];
        const localOwing = _.cloneDeep(draft);

        localOwing.forEach((owing) => {
          if (settledOwings.includes(owing)) return;

          settledOwings.push(owing);

          const counters = localOwing.filter(
            (o) => o.payee.name === owing.payer.name && o.payer.name === owing.payee.name,
          );

          settledOwings.push(...counters);

          const sumOfCounters = counters.reduce((sum, o) => sum.add(o.amount), Big(0)).toNumber();

          if (owing.amount > sumOfCounters) {
            owing.amount -= sumOfCounters;
          } else if (owing.amount < sumOfCounters) {
            const temp = _.cloneDeep(owing.payee);
            owing.payee = owing.payer;
            owing.payer = temp;
            owing.amount = sumOfCounters - owing.amount;
          } else {
            return;
          }

          newOwings.push(owing);
        });

        draft.splice(0, draft.length, ...newOwings);
      }
    });

    return newOwings;
  };

  useEffect(() => {
    setOwings(optimizeOwings(state.owings));
  }, [state.owings]);

  const handleSinglePayerSubmit = (
    values: Record<string, any>,
    _e: FormEvent<HTMLFormElement> | undefined,
  ) => {
    const distributor = values['person'];
    if (distributor === null) {
      setOwings(optimizeOwings(state.owings));
      return;
    }

    const newPayer = state.people.find((p) => p.name === distributor);
    if (newPayer == null) return;

    const newOwings = produce(owings, (draft) => {
      const toUpdate = draft.filter((o) => o.payee.name !== newPayer.name);

      toUpdate.forEach((o) => {
        draft.push({ amount: o.amount, payer: newPayer, payee: o.payee });

        o.payee = newPayer;
      });
    });

    setOwings(optimizeOwings(newOwings));
  };

  return (
    <>
      <Title order={2}>Settlements</Title>
      <form
        onSubmit={singlePayerForm.onSubmit(handleSinglePayerSubmit)}
        className="flex gap-2 items-end"
      >
        <Select
          label="Distributor"
          allowDeselect
          key={singlePayerForm.key('person')}
          {...singlePayerForm.getInputProps('person')}
          data={state.people.map((p) => p.name)}
        />
        <Button type="submit">Apply</Button>
      </form>

      <div className="my-4">
        <SplitTable owings={owings} />
      </div>
      <Tooltip label="Share">
        <ActionIcon
          onClick={() => {
            modals.open({
              size: 'xl',
              title: 'Share',
              children: <ShareModal owings={owings} />,
            });
          }}
        >
          <IconShare fontSize={16} />
        </ActionIcon>
      </Tooltip>
      <Title order={3}>Summary</Title>
      <Title order={4}>Total Owed</Title>
      <List
        withPadding
        listStyleType="disc"
      >
        {(() => {
          const totalOwed = owings.reduce(
            (acc, o) => {
              if (acc[o.payee.name] == null) {
                acc[o.payee.name] = 0;
              }

              acc[o.payee.name] += o.amount;

              return acc;
            },
            {} as Record<string, number>,
          );

          return Object.keys(totalOwed).map((k) => (
            <List.Item key={`${k}-${totalOwed[k]}`}>
              {k} is owed RM {totalOwed[k].toFixed(2)}
            </List.Item>
          ));
        })()}
      </List>
      <Title order={4}>Total Spent</Title>
      <List
        withPadding
        listStyleType="disc"
      >
        {(() => {
          const totalSpent = state.items.reduce(
            (acc, i) => {
              if (acc[i.payer.name] == null) {
                acc[i.payer.name] = 0;
              }

              acc[i.payer.name] += i.cost;

              return acc;
            },
            {} as Record<string, number>,
          );

          return Object.keys(totalSpent).map((k) => (
            <List.Item key={`${k}-${totalSpent[k]}`}>
              {k} spent RM {totalSpent[k].toFixed(2)}
            </List.Item>
          ));
        })()}
      </List>
    </>
  );
};

export default SplitPage;
