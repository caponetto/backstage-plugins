import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { InfoCard, Progress } from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import { Button, Grid, Typography } from '@material-ui/core';

import { WorkflowDataInputSchemaResponse } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';

export interface ExecuteWorkflowPageProps {
  initialState?: Record<string, JsonValue>;
}

export const ExecuteWorkflowPage = (props: ExecuteWorkflowPageProps) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const [loading, setLoading] = useState(false);
  const [schemaResponse, setSchemaResponse] =
    useState<WorkflowDataInputSchemaResponse>();
  // @ts-ignore:
  const [formState, setFormState] = useState(props.initialState);

  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);

  useEffect(() => {
    setLoading(true);
    orchestratorApi
      .getWorkflowDataInputSchema(workflowId)
      .then(response => {
        setSchemaResponse(response);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orchestratorApi, workflowId]);

  const onExecute = useCallback(async () => {
    const parameters: Record<string, JsonValue> = {};
    if (schemaResponse?.schema && formState) {
      for (const key in formState) {
        if (formState.hasOwnProperty(key)) {
          const property = formState[key];
          Object.assign(parameters, property);
        }
      }
    }

    setLoading(true);
    const response = await orchestratorApi.executeWorkflow({
      workflowId,
      parameters,
    });
    setLoading(false);

    navigate(instanceLink({ instanceId: response.id }));
  }, [
    formState,
    instanceLink,
    navigate,
    orchestratorApi,
    schemaResponse,
    workflowId,
  ]);

  const executeButton = useMemo(
    () => (
      <Button variant="contained" color="primary" onClick={onExecute}>
        Execute
      </Button>
    ),
    [onExecute],
  );

  return (
    <BaseOrchestratorPage title="Execute">
      {loading && <Progress />}
      {schemaResponse && (
        <InfoCard
          title={schemaResponse.workflowItem.definition.name ?? workflowId}
        >
          {/* The multi-step form should be here */}
          {schemaResponse?.schema ? (
            <>{executeButton}</>
          ) : (
            <Grid container spacing={2} direction="column">
              <Grid item>
                <Typography>
                  No data input schema found for this workflow
                </Typography>
              </Grid>
              <Grid item>{executeButton}</Grid>
            </Grid>
          )}
        </InfoCard>
      )}
    </BaseOrchestratorPage>
  );
};
