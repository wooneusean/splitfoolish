import { Button, MultiSelect, NumberInput, Select, Table, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext/AppContext';
import { IItem } from '../interfaces/app-reducer';

const ItemList = () => {
  const { state, dispatch } = useContext(AppContext);
  const itemForm = useForm({ mode: 'uncontrolled' });

  const handleItemSubmit = (
    values: Record<string, any>,
    e: React.FormEvent<HTMLFormElement> | undefined
  ) => {
    const participants = state.people.filter((p) => values['participants'].includes(p.name));
    const payer = state.people.find((p) => p.name === values['payer']);

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        cost: values['cost'],
        name: values['name'],
        participants,
        payer,
        strategy: values['strategy'],
      } as IItem,
    });

    itemForm.reset();
  };

  return (
    <>
      <form
        onSubmit={itemForm.onSubmit(handleItemSubmit)}
        className="grid grid-cols-4 gap-2"
      >
        <TextInput
          autoFocus
          key={itemForm.key('name')}
          {...itemForm.getInputProps('name')}
          label="Item"
        />
        <NumberInput
          key={itemForm.key('cost')}
          {...itemForm.getInputProps('cost')}
          label="Cost"
        />
        <Select
          key={itemForm.key('payer')}
          {...itemForm.getInputProps('payer')}
          label="Who paid?"
          data={state.people.map((p) => p.name)}
          className="col-span-2"
        />
        <Select
          key={itemForm.key('strategy')}
          {...itemForm.getInputProps('strategy')}
          label="Splitting strategy"
          data={[
            { label: 'Equally', value: 'equally' },
            { label: 'Payer pays, all owes payer', value: 'owingPayer' },
            { label: 'Covered by payer, all owes payer nothing', value: 'payerCovers' },
          ]}
          name="strategy"
          className="col-span-2"
        />
        <MultiSelect
          key={itemForm.key('participants')}
          {...itemForm.getInputProps('participants')}
          label="Split amongst?"
          data={state.people.map((p) => p.name)}
          name="participants"
          className="col-span-2"
        />
        <Button
          className="mt-2 col-span-full"
          type="submit"
        >
          Add Item
        </Button>
      </form>

      <Table className="my-4">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Item</Table.Th>
            <Table.Th>Cost</Table.Th>
            <Table.Th>Paid by</Table.Th>
            <Table.Th>Split by</Table.Th>
            <Table.Th>Participants</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {state.items.length === 0 ? (
            <Table.Tr>
              <Table.Td
                className="text-center text-gray-400"
                colSpan={5}
              >
                There are no items to show.
              </Table.Td>
            </Table.Tr>
          ) : null}
          {state.items.map((i, ix) => (
            <Table.Tr key={ix}>
              <Table.Td>{i.name}</Table.Td>
              <Table.Td align="right">RM {i.cost.toFixed(2)}</Table.Td>
              <Table.Td>{i.payer.name}</Table.Td>
              <Table.Td>{i.strategy}</Table.Td>
              <Table.Td>
                <span title={i.participants.map((p) => p.name).join(', ')}>
                  {i.participants.length}
                </span>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};

export default ItemList;
