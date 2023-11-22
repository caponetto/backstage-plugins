import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import {
  Content,
  ErrorBoundary,
  Header,
  InfoCard,
  Page,
  Progress,
} from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';

import { orchestratorApiRef } from '../../api';
import {
  editWorkflowRouteRef,
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { EditorViewKind, WorkflowEditor } from '../WorkflowEditor';
import WorkflowDefinitionDetailsCard from './WorkflowDefinitionDetailsCard';

export const WorkflowDefinitionViewerPage = () => {
  const { workflowId, format } = useRouteRefParams(workflowDefinitionsRouteRef);

  const orchestratorApi = useApi(orchestratorApiRef);
  const { loading, value: workflowOverview } = useAsync(() =>
    orchestratorApi.getWorkflowOverview(workflowId),
  );

  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);
  const editWorkflowLink = useRouteRef(editWorkflowRouteRef);
  const workflowFormat = useMemo(
    () => (format === 'json' ? 'json' : 'yaml'),
    [format],
  );

  const onExecute = () => {
    navigate(executeWorkflowLink({ workflowId }));
  };

  const onEdit = () => {
    navigate(editWorkflowLink({ workflowId, format }));
  };

  return (
    <ErrorBoundary>
      {loading && <Progress />}
      <Page themeId="tool">
        <Header
          title={workflowOverview?.name || ''}
          type="workflows"
          typeLink="/orchestrator"
        />
        <Content>
          <Grid container spacing={2} direction="column" wrap="nowrap">
            <Grid container justifyContent="flex-end" item spacing={1}>
              <Grid item>
                <Button variant="contained" color="primary" onClick={onEdit}>
                  Edit
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" color="primary" onClick={onExecute}>
                  Run
                </Button>
              </Grid>
            </Grid>
            <Grid item>
              {workflowOverview && (
                <WorkflowDefinitionDetailsCard
                  workflowOverview={workflowOverview}
                />
              )}
            </Grid>
            <Grid item>
              <InfoCard variant="fullHeight">
                <div style={{ height: '600px' }}>
                  <WorkflowEditor
                    kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                    workflowId={workflowId}
                    format={workflowFormat}
                  />
                </div>
              </InfoCard>
            </Grid>
          </Grid>
        </Content>
      </Page>
    </ErrorBoundary>
  );
};
