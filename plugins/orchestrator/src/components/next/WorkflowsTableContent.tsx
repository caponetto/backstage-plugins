import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';

import Button from '@material-ui/core/Button/Button';
import Grid from '@material-ui/core/Grid/Grid';

import { WorkflowItem } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { newWorkflowRef } from '../../routes';
import { WorkflowsTable } from './WorkflowsTable';

export const WorkflowsTableContent = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const navigate = useNavigate();
  const newWorkflowLink = useRouteRef(newWorkflowRef);
  const { value, error, loading } = useAsync(async (): Promise<
    WorkflowItem[]
  > => {
    const data = await orchestratorApi.listWorkflows();
    return data.items;
  }, []);

  const isReady = React.useMemo(() => !loading && !error, [loading, error]);

  return (
    <>
      {loading ? <Progress /> : null}
      {error ? <ResponseErrorPanel error={error} /> : null}
      {isReady ? (
        <>
          <Grid container direction="row-reverse">
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(newWorkflowLink())}
              >
                Create new
              </Button>
            </Grid>
          </Grid>
          <Grid container direction="column">
            <Grid item>
              <WorkflowsTable items={value ?? []} />
            </Grid>
          </Grid>
        </>
      ) : null}
    </>
  );
};
