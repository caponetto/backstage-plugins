import React from 'react';
import { useAsyncRetry } from 'react-use';

import {
  ContentHeader,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';

import { orchestratorApiRef } from '../api';
import { workflowInstanceRouteRef } from '../routes';
import { isNonNullable } from '../utils/TypeGuards';
import { BaseOrchestratorPage } from './BaseOrchestratorPage';
import { WorkflowInstancePageContent } from './WorkflowInstancePageContent';

export const WorkflowInstancePage = ({
  instanceId,
}: {
  instanceId?: string;
}) => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { instanceId: queryInstanceId } = useRouteRefParams(
    workflowInstanceRouteRef,
  );

  const {
    loading: loadingInstance,
    error: errorInstance,
    value: valueInstance,
    retry: retryInstance,
  } = useAsyncRetry(async () => {
    if (!instanceId && !queryInstanceId) {
      return undefined;
    }
    return await orchestratorApi.getInstance(instanceId || queryInstanceId);
  }, [orchestratorApi, queryInstanceId]);

  const {
    loading: loadingAssessment,
    error: errorAssessment,
    value: valueAssessment,
  } = useAsyncRetry(async () => {
    const businessKey = (
      (valueInstance?.variables as Record<string, unknown>)
        ?.workflowdata as Record<string, unknown>
    )?.businessKey as string;
    if (businessKey === undefined) {
      return undefined;
    }
    return await orchestratorApi.getInstance(businessKey);
  }, [orchestratorApi, valueInstance]);

  const isInstanceReady = React.useMemo(
    () => !loadingInstance && !errorInstance,
    [loadingInstance, errorInstance],
  );

  const isAssessmentReady = React.useMemo(
    () => !loadingAssessment && !errorAssessment,
    [loadingAssessment, errorAssessment],
  );

  const handleAbort = React.useCallback(async () => {
    if (valueInstance) {
      // eslint-disable-next-line no-alert
      const yes = window.confirm(
        'Are you sure you want to abort this instance?',
      );

      if (yes) {
        try {
          await orchestratorApi.abortWorkflow(valueInstance.id);
          retryInstance();
        } catch (e) {
          // eslint-disable-next-line no-alert
          window.alert(
            `The abort operation failed with the following error: ${
              (e as Error).message
            }`,
          );
        }
      }
    }
  }, [orchestratorApi, retryInstance, valueInstance]);

  return (
    <BaseOrchestratorPage
      title={valueInstance?.processId ?? valueInstance?.id ?? instanceId}
      type="Workflow runs"
      typeLink="/orchestrator/instances"
    >
      {loadingInstance && isAssessmentReady ? <Progress /> : null}
      {errorInstance ? <ResponseErrorPanel error={errorInstance} /> : null}
      {errorAssessment ? <ResponseErrorPanel error={errorAssessment} /> : null}
      {isInstanceReady && isNonNullable(valueInstance) ? (
        <>
          <ContentHeader title="">
            <Grid container item justifyContent="flex-end" spacing={1}>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={valueInstance?.state !== 'ACTIVE'}
                  onClick={
                    valueInstance?.state === 'ACTIVE' ? handleAbort : undefined
                  }
                >
                  Abort
                </Button>
              </Grid>
            </Grid>
          </ContentHeader>
          <WorkflowInstancePageContent
            processInstance={valueInstance}
            assessmentInstance={valueAssessment}
          />
        </>
      ) : null}
    </BaseOrchestratorPage>
  );
};
WorkflowInstancePage.displayName = 'WorkflowInstancePage';
