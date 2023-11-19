import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';
import { JsonValue } from '@backstage/types';

import { Meta, StoryObj } from '@storybook/react';

import {
  Job,
  ProcessInstance,
  ProcessInstanceState,
  WorkflowDataInputSchemaResponse,
  WorkflowExecutionResponse,
  WorkflowItem,
  WorkflowListResult,
  WorkflowSpecFile,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { OrchestratorApi } from '../../api/api';
import { orchestratorRootRouteRef } from '../../routes';
import { OrchestratorPage } from './OrchestratorPage';

const mockWorkflowItem: WorkflowItem = {
  definition: {
    id: '1234',
    version: '1.0.0',
    specVersion: '1.0.1',
    name: '2b-or-not-2b-workflow',
    states: [{}],
  },
  uri: 'wf-uri.sw.json',
};
const mockOrchestratorApi: OrchestratorApi = {
  createWorkflowDefinition(
    _uri: string,
    _content?: string,
  ): Promise<WorkflowItem> {
    return Promise.resolve(mockWorkflowItem);
  },
  deleteWorkflowDefinition(_workflowId: string): Promise<any> {
    return Promise.resolve(undefined);
  },
  executeWorkflow(_args: {
    workflowId: string;
    parameters: Record<string, JsonValue>;
  }): Promise<WorkflowExecutionResponse> {
    return Promise.resolve({ id: '42' });
  },
  getInstance(_instanceId: string): Promise<ProcessInstance> {
    return Promise.resolve({
      id: '43',
      processId: '5',
      nodes: [],
      state: ProcessInstanceState.Active,
      endpoint: 'foo.swf.com',
      start: new Date(Date.now()),
      lastUpdate: new Date(Date.now()),
    });
  },
  getInstanceJobs(_instanceId: string): Promise<Job[]> {
    return Promise.resolve([]);
  },
  getInstances(): Promise<ProcessInstance[]> {
    return Promise.resolve([]);
  },
  getSpecs(): Promise<WorkflowSpecFile[]> {
    return Promise.resolve([]);
  },
  getWorkflow(_workflowId: string): Promise<WorkflowItem> {
    return Promise.resolve(mockWorkflowItem);
  },
  getWorkflowDataInputSchema(
    _workflowId: string,
  ): Promise<WorkflowDataInputSchemaResponse> {
    return Promise.resolve({
      schema: undefined,
      workflowItem: mockWorkflowItem,
    });
  },
  listWorkflows(): Promise<WorkflowListResult> {
    return Promise.resolve({
      items: [mockWorkflowItem],
      totalCount: 1,
      offset: 2,
      limit: 3,
    });
  },
};

const meta = {
  title: 'Orchestrator',
  component: OrchestratorPage,
  decorators: [
    Story =>
      wrapInTestApp(
        <TestApiProvider apis={[[orchestratorApiRef, mockOrchestratorApi]]}>
          <Story />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      ),
  ],
} satisfies Meta<typeof OrchestratorPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OrchestratorPageStory: Story = {
  name: 'OrchestratorPage',
  args: {},
};
