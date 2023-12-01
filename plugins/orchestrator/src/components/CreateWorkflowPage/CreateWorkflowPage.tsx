import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import {
  alertApiRef,
  errorApiRef,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';

import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { workflow_title } from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import {
  editWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import { NewEditor } from '../WorkflowEditor/NewEditor';
import { useWorkflowEditor } from '../WorkflowEditor/use-workflow-editor';

export const CreateWorkflowPage = () => {
  const { format } = useParams();
  const { workflowId } = useRouteRefParams(editWorkflowRouteRef);
  const errorApi = useApi(errorApiRef);
  const alertApi = useApi(alertApiRef);
  const orchestratorApi = useApi(orchestratorApiRef);
  const navigate = useNavigate();
  const definitionLink = useRouteRef(workflowDefinitionsRouteRef);
  const [loading, setLoading] = useState(false);

  const workflowFormat = format === 'json' ? 'json' : 'yaml';

  const { validate, content, workflowURI, setContent, languageServer } =
    useWorkflowEditor(workflowId, workflowFormat);

  const handleResult = useCallback(async () => {
    if (!content || !workflowURI) {
      return;
    }
    try {
      const notifications = await validate();
      if (notifications.length !== 0) {
        const messages = notifications.map(n => n.message).join('; ');
        errorApi.post({
          name: 'Validation error',
          message: `The workflow cannot be saved due to: ${messages}`,
        });
        return;
      }

      setLoading(true);

      const workflowItem = await orchestratorApi.createWorkflowDefinition(
        workflowURI,
        content,
      );
      if (!workflowItem?.definition.id) {
        errorApi.post(new Error('Error creating workflow'));
        return;
      }

      alertApi.post({
        severity: 'info',
        message: `Workflow ${workflowItem.definition.id} has been saved.`,
      });
      navigate(
        definitionLink({
          workflowId: workflowItem.definition.id,
          format: workflowFormat,
        }),
      );
    } catch (e: any) {
      errorApi.post(new Error(e));
    } finally {
      setLoading(false);
    }
  }, [
    errorApi,
    orchestratorApi,
    alertApi,
    navigate,
    definitionLink,
    workflowFormat,
    validate,
  ]);

  const editorReady = !!content && !!workflowURI && !!languageServer;

  return (
    <BaseOrchestratorPage>
      <ContentHeader
        title={`Authoring - ${workflowFormat.toLocaleUpperCase('en-US')}`}
      >
        <OrchestratorSupportButton />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          {(loading || !editorReady) && <Progress />}
          {editorReady && (
            <InfoCard
              action={
                <Button
                  color="primary"
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  style={{ marginTop: 8, marginRight: 8 }}
                  onClick={handleResult}
                >
                  Save
                </Button>
              }
              title={workflowId ?? `New ${workflow_title}`}
            >
              <NewEditor
                content={content}
                setContent={setContent}
                workflowURI={workflowURI}
                languageServer={languageServer}
              />
            </InfoCard>
          )}
        </Grid>
      </Grid>
    </BaseOrchestratorPage>
  );
};
