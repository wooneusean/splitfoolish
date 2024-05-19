import {
  ActionIcon,
  Button,
  MultiSelect,
  NumberInput,
  Select,
  Table,
  Tabs,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { FormEventHandler, act, useContext, useRef, useState } from 'react';
import './App.css';
import { AppContext } from './context/AppContext/AppContext';
import { IItem, IOwing } from './interfaces/app-reducer';
import { IconArrowsSplit, IconListDetails, IconPlus, IconUser } from '@tabler/icons-react';
import PersonList from './components/PersonList';
import ItemList from './components/ItemList';
import ErrorBoundary from './components/ErrorBoundary';

/**
 * People modal -> store people
 * Draft settlement -> print settlement
 * Main list for costs
 */
function App() {
  const { state, dispatch } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<string | null>('0');

  const handleSplit = () => {
    dispatch({
      type: 'SPLIT',
      payload: null,
    });
  };

  const nextTab = () => {
    if (activeTab === null) return;

    const nextTab = parseInt(activeTab) + 1;

    if (nextTab > 2) {
      return;
    }

    setActiveTab(nextTab.toString());
  };

  const prevTab = () => {
    if (activeTab === null) return;

    const nextTab = parseInt(activeTab) - 1;

    if (nextTab < 0) {
      return;
    }

    setActiveTab(nextTab.toString());
  };

  return (
    <div className="max-w-screen-sm m-auto bg-white min-h-screen">
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
      >
        <Tabs.List>
          <Tabs.Tab
            value="0"
            leftSection={<IconUser />}
          >
            People
          </Tabs.Tab>
          <Tabs.Tab
            value="1"
            leftSection={<IconListDetails />}
          >
            Items
          </Tabs.Tab>
          <Tabs.Tab
            value="2"
            leftSection={<IconArrowsSplit />}
          >
            Split
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel
          value="0"
          className="p-4"
        >
          <ErrorBoundary fallback={<div>An error occured.</div>}>
            <PersonList />
          </ErrorBoundary>
        </Tabs.Panel>

        <Tabs.Panel
          value="1"
          className="p-4"
        >
          <ErrorBoundary fallback={<div>An error occured.</div>}>
            <ItemList />
          </ErrorBoundary>
        </Tabs.Panel>

        <Tabs.Panel
          value="2"
          className="p-4"
        >
          {/* Somehow need to fix this part */}
          <ErrorBoundary fallback={<div>An error occured.</div>}>
            <Button onClick={() => handleSplit()}>Split</Button>
            <ul>
              {state.owings.map((o) => {
                if (o.creditor.name === o.debtor.name) {
                  return (
                    <li>
                      {o.debtor.name} pays RM {o.amount}
                    </li>
                  );
                }

                return (
                  <li>
                    {o.debtor.name} owes RM {o.amount} to {o.creditor.name}
                  </li>
                );
              })}
            </ul>
          </ErrorBoundary>
        </Tabs.Panel>
      </Tabs>
      <div className="flex w-full justify-between">
        <Button onClick={() => prevTab()}>Prev</Button>
        <Button onClick={() => nextTab()}>Next</Button>
      </div>
    </div>
  );
}

export default App;
