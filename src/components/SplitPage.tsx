import { Button, List, Select, Table, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCopy } from '@tabler/icons-react';
import { produce } from 'immer';
import _ from 'lodash';
import { FormEvent, useContext, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { AppContext } from '../context/AppContext/AppContext';
import { IOwing } from '../interfaces/app-reducer';

const SplitPage = () => {
  const { state } = useContext(AppContext);
  const [owings, setOwings] = useImmer(state.owings);
  const singlePayerForm = useForm({ mode: 'uncontrolled' });

  const optimizeOwings = (unoptimizedOwings: IOwing[]): IOwing[] => {
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
              o !== owing && o.payee.name === owing.payee.name && o.payer.name === owing.payer.name
          );

          settledOwings.push(...duplicates);

          const sumOfDuplicates = duplicates.reduce((sum, o) => sum + o.amount, 0);

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
            (o) => o.payee.name === owing.payer.name && o.payer.name === owing.payee.name
          );

          settledOwings.push(...counters);

          const sumOfCounters = counters.reduce((sum, o) => sum + o.amount, 0);

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
    if (state.owings == null || state.owings.length === 0) return;

    setOwings(optimizeOwings(state.owings));
  }, [state.owings]);

  const handleSinglePayerSubmit = (
    values: Record<string, any>,
    _e: FormEvent<HTMLFormElement> | undefined
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

  function copyCsv(): void {
    const csvData = [
      ['Payer', 'Payee', 'Amount'].join('\t'), // CSV header row
      ...owings.map((owing) => `"${owing.payer.name}"\t"${owing.payee.name}"\t"${owing.amount}"`),
    ].join('\n');

    navigator.clipboard
      .writeText(csvData)
      .then(() => {
        notifications.show({ message: 'Owings copied to clipboard as CSV' });
      })
      .catch((_err) => {
        notifications.show({ message: 'Failed to copy owings to clipboard as CSV:' });
      });
  }

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
        <Button
          onClick={() => copyCsv()}
          leftSection={<IconCopy size="14" />}
          size="xs"
        >
          Copy CSV
        </Button>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Payer</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Payee</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {owings.length === 0 ? (
              <Table.Tr>
                <Table.Td
                  className="text-center text-gray-400"
                  colSpan={5}
                >
                  There are no items to show.
                </Table.Td>
              </Table.Tr>
            ) : null}
            {owings.map((o, ix) => (
              <Table.Tr key={ix}>
                <Table.Td>{o.payer.name}</Table.Td>
                <Table.Td align="right">RM {o.amount.toFixed(2)}</Table.Td>
                <Table.Td>{o.payee.name}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
          <Table.Tfoot className="border-double border-t-4">
            <Table.Tr>
              <Table.Td></Table.Td>
              <Table.Td
                className="font-bold"
                align="right"
              >
                RM {owings.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}
              </Table.Td>
              <Table.Td></Table.Td>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </div>

      <Title
        order={3}
        className=""
      >
        Summary
      </Title>
      <List
        withPadding
        listStyleType="disc"
      >
        {(() => {
          const summary = owings.reduce((acc, o) => {
            if (acc[o.payee.name] == null) {
              acc[o.payee.name] = 0;
            }
            acc[o.payee.name] += o.amount;

            return acc;
          }, {} as Record<string, number>);

          return Object.keys(summary).map((k) => (
            <List.Item key={`${k}-${summary[k]}`}>
              {k} is owed RM {summary[k].toFixed(2)}
            </List.Item>
          ));
        })()}
      </List>
    </>
  );
};

export default SplitPage;
