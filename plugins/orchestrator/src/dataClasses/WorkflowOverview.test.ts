import { WorkflowOverview as RawWorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import WorkflowOverview from './WorkflowOverview';

const mockWorkflowOverview: RawWorkflowOverview = {
  workflowId: '123',
  name: 'Sample Workflow',
  lastTriggeredMs: 1697276096000,
  lastRunStatus: 'Success',
  type: 'Sample Type',
  avgDurationMs: 150000,
  description: 'Sample description',
  uri: 'sample.workflow.sw.yaml',
};

describe('WorkflowOverviewAdapter', () => {
  it('should adapt WorkflowOverview to AdaptedWorkflowOverview', () => {
    const formattedData: WorkflowOverview =
      WorkflowOverview.from(mockWorkflowOverview);

    expect(formattedData.id).toBe(mockWorkflowOverview.workflowId);
    expect(formattedData.name).toBe(mockWorkflowOverview.name);
    expect(formattedData.lastTriggered).toBe('14/10/23 09:34:56');
    expect(formattedData.lastRunStatus).toBe(
      mockWorkflowOverview.lastRunStatus,
    );
    expect(formattedData.type).toBe(mockWorkflowOverview.type);
    expect(formattedData.avgDuration).toBe('2 min');
    expect(formattedData.description).toBe(mockWorkflowOverview.description);
    expect(formattedData.format).toBe('yaml'); // Adjust based on your expected value
  });

  it('should have --- for undefined data', () => {
    const partialMock: RawWorkflowOverview = {
      workflowId: '123',
    };
    const formattedData: WorkflowOverview = WorkflowOverview.from(partialMock);

    expect(formattedData.id).toBe(mockWorkflowOverview.workflowId);
    expect(formattedData.name).toBe('---');
    expect(formattedData.lastTriggered).toBe('---');
    expect(formattedData.lastRunStatus).toBe('---');
    expect(formattedData.type).toBe('---');
    expect(formattedData.avgDuration).toBe('---');
    expect(formattedData.description).toBe('---');
    expect(formattedData.format).toBe('yaml');
  });

  it('formatted workflow overview data object should be immutable', () => {
    let error;
    try {
      const formattedData: WorkflowOverview =
        WorkflowOverview.from(mockWorkflowOverview);
      formattedData.id = '3';
    } catch (err) {
      error = err;
    }
    expect((error as Error).message).toEqual(
      `Cannot assign to read only property 'id' of object '#<WorkflowOverview>'`,
    );
  });
});
