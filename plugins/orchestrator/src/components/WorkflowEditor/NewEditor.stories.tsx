import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import { fakeProcessInstances } from '../../__fixtures__/fakeProcessInstance';
import { fakeWorkflowItem } from '../../__fixtures__/fakeWorkflowItem';
import { orchestratorApiRef } from '../../api';
import { MockOrchestratorClient } from '../../api/MockOrchestratorClient';
import { orchestratorRootRouteRef } from '../../routes';
import { fakeSpecs } from './fixtures/fakeSpecs';
import { NewEditor } from './NewEditor';
import { useWorkflowEditor } from './use-workflow-editor';

const EditorWrapper = () => {
  const { content, languageServer, workflowURI, ...editorProps } =
    useWorkflowEditor('foo');
  return content && languageServer && workflowURI ? (
    <NewEditor
      content={content}
      languageServer={languageServer}
      workflowURI={workflowURI}
      {...editorProps}
    />
  ) : (
    <div> loading </div>
  );
};

const meta = {
  title: 'Orchestrator/next',
  component: EditorWrapper,
} satisfies Meta<typeof EditorWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** This component is used in order to correctly render nested components using the `TabbedLayout.Route` component. */
const TestRouter: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <Routes>
    <Route path="/*" element={<>{children}</>} />
  </Routes>
);

export const WorkflowEditorStory: Story = {
  name: 'WorkflowEditor',
  render: args =>
    wrapInTestApp(
      <TestRouter>
        <TestApiProvider
          apis={[
            [
              orchestratorApiRef,
              new MockOrchestratorClient({
                getInstancesResponse: Promise.resolve(fakeProcessInstances),
                listWorkflowsResponse: Promise.resolve({
                  limit: 0,
                  offset: 0,
                  totalCount: 0,
                  items: [fakeWorkflowItem],
                }),
                getSpecsResponse: Promise.resolve(fakeSpecs as any),
                getWorkflowResponse: Promise.resolve(fakeWorkflowItem),
              }),
            ],
          ]}
        >
          <EditorWrapper />
        </TestApiProvider>
      </TestRouter>,
      {
        mountedRoutes: {
          '/workloweditor': orchestratorRootRouteRef,
        },
      },
    ),
};
