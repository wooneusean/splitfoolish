import { ActionIcon, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import React, { useContext, useEffect, useRef } from 'react';
import { AppContext } from '../context/AppContext/AppContext';

const PersonList = () => {
  const { state, dispatch } = useContext(AppContext);
  const personForm = useForm({ mode: 'uncontrolled' });
  const personInputRef = useRef<HTMLInputElement>(null);

  const handlePersonSubmit = (
    values: Record<string, any>,
    e: React.FormEvent<HTMLFormElement> | undefined
  ) => {
    dispatch({ type: 'ADD_PERSON', payload: values['name'] });

    personForm.reset();
  };

  return (
    <div className="flex flex-col gap-2">
      {state.people.map((p) => (
        <TextInput
          key={p.name}
          className="w-full"
          readOnly
          value={p.name}
          rightSection={
            <ActionIcon
              color="red"
              type="submit"
            >
              <IconMinus />
            </ActionIcon>
          }
        ></TextInput>
      ))}
      <form
        className="flex gap-4 items-end"
        onSubmit={personForm.onSubmit(handlePersonSubmit)}
      >
        <TextInput
          autoFocus
          key={personForm.key('name')}
          {...personForm.getInputProps('name')}
          ref={personInputRef}
          className="w-full"
          rightSection={
            <ActionIcon type="submit">
              <IconPlus />
            </ActionIcon>
          }
        />
      </form>
    </div>
  );
};

export default PersonList;
