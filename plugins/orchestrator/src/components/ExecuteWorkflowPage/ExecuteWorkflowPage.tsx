import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAsync } from 'react-use';

import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import { Box, Grid, useTheme } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { Editor } from '@monaco-editor/react';

import {
<<<<<<< HEAD
  WORKFLOW_TITLE,
=======
  getWorkflowCategory,
  WorkflowCategory,
>>>>>>> 466de6e (feat(orchestrator): execute workflow page)
  WorkflowDataInputSchemaResponse,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  executeWorkflowWithBusinessKeyRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { getErrorObject } from '../../utils/error';
import { BaseOrchestratorPage } from '../next/BaseOrchestratorPage';
import SubmitBtn from '../SubmitBtn/SubmitBtn';
import StepperForm from './StepperForm';

export interface ExecuteWorkflowPageProps {
  initialState?: Record<string, JsonValue>;
}

const JsonTextAreaForm = ({
  isExecuting,
  handleExecute,
}: {
  isExecuting: boolean;
  handleExecute: (
    getParameters: () => Record<string, JsonValue>,
  ) => Promise<void>;
}) => {
  const [jsonText, setJsonText] = React.useState('');
  const theme = useTheme();
  const getParameters = (): Record<string, JsonValue> => {
    if (!jsonText) {
      return {};
    }
    const parameters = JSON.parse(jsonText);
    return parameters as Record<string, JsonValue>;
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="info" style={{ width: '100%' }}>
          <AlertTitle>
            Couldn't find a valid JSON schema to display the input form.
          </AlertTitle>
          If you want to use a form to start the workflow, please provide a
          valid JSON schema in the dataInputSchema property of your workflow
          definition file. Alternatively, you can type below the input data in
          JSON format.
        </Alert>
      </Grid>
      <Grid item xs={12}>
        <Box style={{ border: `1px solid ${theme.palette.border}` }}>
          <Editor
            language="json"
            onChange={(value: string | undefined) => setJsonText(value || '')}
            height="30rem"
            options={{
              lineNumbers: 'off',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              minimap: { enabled: false },
            }}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <SubmitBtn
          submitting={isExecuting}
          handleClick={() => handleExecute(getParameters)}
        >
          Run
        </SubmitBtn>
      </Grid>
    </Grid>
  );
};

export const ExecuteWorkflowPage = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const { businessKey } = useRouteRefParams(
    executeWorkflowWithBusinessKeyRouteRef,
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [updateError, setUpdateError] = React.useState<Error>();
  const navigate = useNavigate();
  const instanceLink = useRouteRef(workflowInstanceRouteRef);

  const {
    value: schemaResponse,
    loading,
    error: responseError,
  } = useAsync(
    async (): Promise<WorkflowDataInputSchemaResponse> =>
      await orchestratorApi.getWorkflowDataInputSchema(workflowId),
    [orchestratorApi, workflowId],
  );

  const handleExecute = useCallback(
    async (getParameters: () => Record<string, JsonValue>) => {
      setUpdateError(undefined);
      let parameters: Record<string, JsonValue> = {};
      try {
        parameters = getParameters();
      } catch (err) {
        setUpdateError(getErrorObject(err));
        return;
      }
<<<<<<< HEAD
    }

    setLoading(true);
    if (businessKey !== undefined) {
      Object.assign(parameters, { businessKey: businessKey });
    }
    const response = await orchestratorApi.executeWorkflow({
=======
      try {
        const workflowCategory = getWorkflowCategory(
          schemaResponse?.workflowItem.definition,
        );
        if (workflowCategory === WorkflowCategory.ASSESSMENT) {
          Object.assign(parameters, { businessKey: crypto.randomUUID() });
        } else if (businessKey) {
          // running infrastructure workflow from assessment workflow
          Object.assign(parameters, { businessKey });
        } // TODO: handle running infrastructure workflow that doesn't have a parent assessment workflow - should this be enabled?
        setIsExecuting(true);
        const response = await orchestratorApi.executeWorkflow({
          workflowId,
          parameters,
        });
        navigate(instanceLink({ instanceId: response.id }));
      } catch (err) {
        setUpdateError(getErrorObject(err));
      } finally {
        setIsExecuting(false);
      }
    },
    [
      schemaResponse,
      orchestratorApi,
>>>>>>> 466de6e (feat(orchestrator): execute workflow page)
      workflowId,
      navigate,
      instanceLink,
      businessKey,
    ],
  );

  let pageContent;

  if (loading) {
    pageContent = <Progress />;
  } else if (responseError) {
    pageContent = <ResponseErrorPanel error={responseError} />;
  } else if (!schemaResponse) {
    pageContent = (
      <ResponseErrorPanel
        error={
          new Error('Request for data input schema returned an empty response')
        }
      />
    );
  } else {
    pageContent = (
      <Grid container spacing={2} direction="column" wrap="nowrap">
        {updateError && (
          <Grid item>
            <ResponseErrorPanel error={updateError} />
          </Grid>
        )}
        <Grid item>
          <InfoCard title={schemaResponse.workflowItem.definition.name}>
            {schemaResponse.schemas.length > 0 ? (
              <StepperForm
                refSchemas={schemaResponse.schemas}
                handleExecute={handleExecute}
                isExecuting={isExecuting}
              />
            ) : (
              <JsonTextAreaForm
                handleExecute={handleExecute}
                isExecuting={isExecuting}
              />
            )}
          </InfoCard>
        </Grid>
      </Grid>
    );
  }

  return (
    <BaseOrchestratorPage
      title="Workflow Orchestrator"
      noPadding={loading ? true : false}
    >
      {pageContent}
    </BaseOrchestratorPage>
  );
};
