import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Table, TableColumn } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import DeleteForever from '@material-ui/icons/DeleteForever';
import Edit from '@material-ui/icons/Edit';
import Pageview from '@material-ui/icons/Pageview';
import PlayArrow from '@material-ui/icons/PlayArrow';
import moment from 'moment';

import {
  ASSESSMENT_WORKFLOW_TYPE,
  extractWorkflowFormatFromUri,
  WorkflowItem,
  WorkflowType,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';

type WorkflowsTableProps = {
  items: WorkflowItem[];
};

export const WorkflowsTable = ({ items }: WorkflowsTableProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const navigate = useNavigate();
  const definitionLink = useRouteRef(workflowDefinitionsRouteRef);
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const editLink = useRouteRef(editWorkflowRouteRef);
  const [data, setData] = useState<Row[]>([]);

  interface Row {
    id: string;
    name: string;
    lastRun: string;
    lastRunStatus: string;
    type: WorkflowType;
    components: string;
    format: string;
  }

  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Last run', field: 'lastRun' },
    { title: 'Last run status', field: 'lastRunStatus' },
    { title: 'Type', field: 'type' },
    { title: 'Components', field: 'components' },
  ];

  const getInitialState = useCallback(() => {
    return items.map(item => {
      return {
        id: item.definition.id,
        name: item.definition.name ?? '',
        lastRun: '',
        lastRunStatus: '',
        type: item.definition.annotations?.find(
          annotation => annotation === ASSESSMENT_WORKFLOW_TYPE,
        )
          ? WorkflowType.ASSESSMENT
          : WorkflowType.INFRASTRUCTURE,
        components: '---',
        format: extractWorkflowFormatFromUri(item.uri),
      };
    });
  }, [items]);

  const load = useCallback(
    (initData: Row[]) => {
      orchestratorApi.getInstances().then(instances => {
        const clonedData: Row[] = [];
        for (const init_row of initData) {
          const row = { ...init_row };
          const instancesById = instances.filter(
            instance => instance.processId === row.id,
          );
          const lastRunInstance = instancesById.at(-1);
          if (lastRunInstance) {
            row.lastRun = moment(lastRunInstance.start?.toString()).format(
              'MMMM DD, YYYY',
            );
            row.lastRunStatus = lastRunInstance.state;
            row.components = instancesById.length.toString();
          }
          clonedData.push(row);
        }
        setData(clonedData);
      });
    },
    [orchestratorApi],
  );

  useEffect(() => {
    const initData = getInitialState();
    setData(initData);
    load(initData);
  }, [getInitialState, load]);

  const doView = useCallback(
    (rowData: Row) => {
      navigate(
        definitionLink({ workflowId: rowData.id, format: rowData.format }),
      );
    },
    [definitionLink, navigate],
  );

  const doExecute = useCallback(
    (rowData: Row) => {
      navigate(executeWorkflowLink({ workflowId: rowData.id }));
    },
    [executeWorkflowLink, navigate],
  );

  const doEdit = useCallback(
    (rowData: Row) => {
      navigate(
        editLink({ workflowId: `${rowData.id}`, format: rowData.format }),
      );
    },
    [editLink, navigate],
  );

  const doDelete = useCallback(
    (rowData: Row) => {
      // Lazy use of window.confirm vs writing a popup.
      if (
        // eslint-disable-next-line no-alert
        window.confirm(
          `Please confirm you want to delete '${rowData.id}' permanently.`,
        )
      ) {
        orchestratorApi.deleteWorkflowDefinition(rowData.id);
      }
    },
    [orchestratorApi],
  );

  return (
    <Table
      options={{ search: true, paging: false, actionsColumnIndex: 5 }}
      columns={columns}
      data={data}
      filters={[{ column: 'Type', type: 'select' }]}
      initialState={{
        filtersOpen: true,
        filters: { Type: WorkflowType.ASSESSMENT },
      }}
      actions={[
        {
          icon: PlayArrow,
          tooltip: 'Execute',
          onClick: (_, rowData) => doExecute(rowData as Row),
        },
        {
          icon: Pageview,
          tooltip: 'View',
          onClick: (_, rowData) => doView(rowData as Row),
        },
        {
          icon: Edit,
          tooltip: 'Edit',
          onClick: (_, rowData) => doEdit(rowData as Row),
        },
        {
          icon: DeleteForever,
          tooltip: 'Delete',
          onClick: (_, rowData) => doDelete(rowData as Row),
        },
      ]}
    />
  );
};
