import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import {
  ErrorPanel,
  InfoCard,
  Link,
  SelectItem,
  Table,
  TableColumn,
  TableProps,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import { Grid } from '@material-ui/core';
import Replay from '@material-ui/icons/Replay';

import {
  ProcessInstanceState,
  ProcessInstanceStateValues,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../api';
import { QUERY_PARAM_INSTANCE_ID, VALUE_UNAVAILABLE } from '../constants';
import { executeWorkflowRouteRef, workflowInstanceRouteRef } from '../routes';
import { capitalize, ellipsis } from '../utils/StringUtils';
import { Selector } from './Selector';
import { mapProcessInstanceToDetails } from './WorkflowInstancePageContent';
import { WorkflowInstanceStatusIndicator } from './WorkflowInstanceStatusIndicator';
import { WorkflowRunDetail } from './WorkflowRunDetail';

const makeSelectItemsFromProcessInstanceValues = () =>
  [
    ProcessInstanceState.Active,
    ProcessInstanceState.Error,
    ProcessInstanceState.Completed,
    ProcessInstanceState.Aborted,
    ProcessInstanceState.Suspended,
  ].map(
    (status): SelectItem => ({
      label: capitalize(status),
      value: status,
    }),
  );

export const WorkflowRunsTabContent = () => {
  const navigate = useNavigate();
  const orchestratorApi = useApi(orchestratorApiRef);
  const workflowInstanceLink = useRouteRef(workflowInstanceRouteRef);
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const [statusSelectorValue, setStatusSelectorValue] = useState<string>(
    Selector.AllItems,
  );

  const { loading, error, value } = useAsync(async () => {
    const instances = await orchestratorApi.getInstances();
    const clonedData: WorkflowRunDetail[] = instances.map(
      mapProcessInstanceToDetails,
    );

    return clonedData;
  }, [orchestratorApi]);

  const columns = React.useMemo(
    (): TableColumn<WorkflowRunDetail>[] => [
      {
        title: 'ID',
        render: data => (
          <Link to={workflowInstanceLink({ instanceId: data.id })}>
            {ellipsis(data.id)}
          </Link>
        ),
      },
      {
        title: 'Name',
        field: 'name',
      },
      {
        title: 'Status',
        render: data => (
          <WorkflowInstanceStatusIndicator
            status={data.status as ProcessInstanceStateValues}
          />
        ),
      },
      {
        title: 'Category',
        render: data => capitalize(data.category ?? VALUE_UNAVAILABLE),
      },
      { title: 'Started', field: 'started' },
      { title: 'Duration', field: 'duration' },
    ],
    [workflowInstanceLink],
  );

  const statuses = React.useMemo(makeSelectItemsFromProcessInstanceValues, []);

  const filteredData = React.useMemo(
    () =>
      (value || []).filter(
        (row: WorkflowRunDetail) =>
          statusSelectorValue === Selector.AllItems ||
          row.status === statusSelectorValue,
      ),
    [statusSelectorValue, value],
  );

  const selectors = React.useMemo(
    () => (
      <Grid container alignItems="center">
        <Grid item>
          <Selector
            label="Status"
            items={statuses}
            onChange={setStatusSelectorValue}
            selected={statusSelectorValue}
          />
        </Grid>
      </Grid>
    ),
    [statusSelectorValue, statuses],
  );

  const handleReRun = useCallback(
    (rowData: WorkflowRunDetail) => {
      navigate(
        `${executeWorkflowLink({
          workflowId: rowData.workflowId,
        })}?${QUERY_PARAM_INSTANCE_ID}=${rowData.id}`,
      );
    },
    [navigate, executeWorkflowLink],
  );

  const actions = useMemo(() => {
    const actionItems: TableProps<WorkflowRunDetail>['actions'] = [
      {
        icon: Replay,
        tooltip: 'Rerun',
        onClick: (_, rowData) => handleReRun(rowData as WorkflowRunDetail),
      },
    ];

    return actionItems;
  }, [handleReRun]);

  return error ? (
    <ErrorPanel error={error} />
  ) : (
    <InfoCard noPadding title={selectors}>
      <Table
        title="Workflow Runs"
        options={{
          search: true,
          paging: true,
          actionsColumnIndex: columns.length,
        }}
        isLoading={loading}
        columns={columns}
        data={filteredData}
        actions={actions}
      />
    </InfoCard>
  );
};
