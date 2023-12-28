import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import {
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import { JsonValue } from '@backstage/types';

import { Button, Grid, Typography } from '@material-ui/core';
import Form, { withTheme } from '@rjsf/core-v5';
import validator from '@rjsf/validator-ajv8';
import * as uuid from 'uuid';

import {
  getWorkflowCategory,
  workflow_title,
  WorkflowCategory,
  WorkflowDataInputSchemaResponse,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  executeWorkflowRouteRef,
  executeWorkflowWithBusinessKeyRouteRef,
  workflowInstanceRouteRef,
} from '../../routes';
import { flattenParametersFromFormState } from '../../utils';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import { WorkflowDialog } from '../WorkflowDialog';
import { EditorViewKind } from '../WorkflowEditor';
import { JsonTextArea, JsonTextAreaRef } from './JsonTextArea';
import { TitleFieldTemplate } from './TitleFieldTemplate';

const WrappedForm = withTheme(require('@rjsf/material-ui-v5').Theme);

export const ExecuteWorkflowPage = () => {
  const orchestratorApi = useApi(orchestratorApiRef);
  const { workflowId } = useRouteRefParams(executeWorkflowRouteRef);
  const { businessKey } = useRouteRefParams(
    executeWorkflowWithBusinessKeyRouteRef,
  );
  const [loading, setLoading] = useState(false);
  const [schemaResponse, setSchemaResponse] =
    useState<WorkflowDataInputSchemaResponse>();
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState<boolean>(false);

  const formRef = useRef<Form>(null);
  const [formState, setFormState] = useState({} as Record<string, JsonValue>);
  const [liveFormValidate, setLiveFormValidate] = useState(false);

  const jsonTextAreaRef = useRef<JsonTextAreaRef>(null);

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

  const onExecute = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!schemaResponse) {
        return;
      }

      let parameters: Record<string, JsonValue> = {};
      if (schemaResponse.dataInputSchema?.mainSchema) {
        if (!formRef.current?.validateForm()) {
          return;
        }
        // Flatten parameters are only necessary for this case where we show one form for all ref schemas (steps).
        parameters = flattenParametersFromFormState(formState);
      } else {
        if (!jsonTextAreaRef.current?.validate()) {
          return;
        }
        parameters = JSON.parse(jsonTextAreaRef.current.getContent());
      }

      const workflowCategory = getWorkflowCategory(
        schemaResponse?.workflowItem.definition,
      );

      if (businessKey) {
        parameters.businessKey = businessKey;
      } else if (workflowCategory === WorkflowCategory.ASSESSMENT) {
        parameters.businessKey = uuid.v4();
      }

      setLoading(true);
      setLiveFormValidate(true);

      const response = await orchestratorApi.executeWorkflow({
        workflowId,
        parameters,
      });

      setLiveFormValidate(false);
      setLoading(false);

      navigate(instanceLink({ instanceId: response.id }));
    },
    [
      schemaResponse,
      orchestratorApi,
      workflowId,
      navigate,
      instanceLink,
      formState,
      businessKey,
    ],
  );

  const onFormChanged = useCallback(
    e => setFormState(current => ({ ...current, ...e.formData })),
    [setFormState],
  );

  const executeButton = useMemo(
    () => (
      <Button
        variant="contained"
        color="primary"
        onClick={onExecute}
        type="submit"
      >
        Execute
      </Button>
    ),
    [onExecute],
  );

  return (
    <BaseOrchestratorPage>
      <ContentHeader title="Execute">
        <OrchestratorSupportButton />
      </ContentHeader>
      {loading && <Progress />}
      {schemaResponse && (
        <InfoCard
          title={schemaResponse.workflowItem.definition.name ?? workflowId}
          subheader={schemaResponse.workflowItem.definition.description}
          action={
            <>
              <Button
                variant="outlined"
                color="secondary"
                style={{ marginTop: 8, marginRight: 8 }}
                onClick={_ => setWorkflowDialogOpen(true)}
              >
                View {workflow_title}
              </Button>
              <WorkflowDialog
                kind={EditorViewKind.EXTENDED_DIAGRAM_VIEWER}
                workflowId={workflowId}
                title={
                  schemaResponse.workflowItem.definition.name ??
                  schemaResponse.workflowItem.definition.id
                }
                open={workflowDialogOpen}
                close={() => setWorkflowDialogOpen(false)}
              />
            </>
          }
        >
          {schemaResponse?.dataInputSchema?.mainSchema ? (
            <WrappedForm
              ref={formRef}
              schema={schemaResponse.dataInputSchema.mainSchema}
              validator={validator}
              showErrorList={false}
              onChange={onFormChanged}
              formData={formState}
              formContext={{ formData: formState }}
              templates={{ TitleFieldTemplate }}
              liveValidate={liveFormValidate}
              noHtml5Validate
            >
              {executeButton}
            </WrappedForm>
          ) : (
            <Grid container spacing={2} direction="column">
              <Grid item>
                <Typography variant="body1">
                  Couldn't find a valid JSON schema to display the input form.
                </Typography>
                <Typography variant="body2">
                  If you want to use a form to start the workflow, please
                  provide a valid JSON schema in the dataInputSchema property of
                  your workflow definition file.
                </Typography>
                <Typography variant="body2">
                  Alternatively, you can type below the input data in JSON
                  format.
                </Typography>
              </Grid>
              <Grid item>
                <JsonTextArea ref={jsonTextAreaRef} />
              </Grid>
              <Grid item>{executeButton}</Grid>
            </Grid>
          )}
        </InfoCard>
      )}
    </BaseOrchestratorPage>
  );
};
