import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ContentHeader, InfoCard, Progress } from '@backstage/core-components';
import { useRouteRef, useRouteRefParams } from '@backstage/core-plugin-api';

import { Button, Grid } from '@material-ui/core';

import {
  executeWorkflowRouteRef,
  workflowDefinitionsRouteRef,
} from '../../routes';
import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import { NewEditor } from '../WorkflowEditor/NewEditor';
import { useWorkflowEditor } from '../WorkflowEditor/use-workflow-editor';

export const WorkflowDefinitionViewerPage = () => {
  const { workflowId, format } = useRouteRefParams(workflowDefinitionsRouteRef);
  const navigate = useNavigate();
  const executeWorkflowLink = useRouteRef(executeWorkflowRouteRef);

  const workflowFormat = format === 'json' ? 'json' : 'yaml';

  const { workflowName, content, workflowURI, languageServer } =
    useWorkflowEditor(workflowId, workflowFormat);

  const onExecute = useCallback(() => {
    navigate(executeWorkflowLink({ workflowId }));
  }, [executeWorkflowLink, navigate, workflowId]);

  return (
    <BaseOrchestratorPage>
      <ContentHeader title="Definition">
        <OrchestratorSupportButton />
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          {!!content && !!workflowURI && !!languageServer ? (
            <InfoCard
              title={workflowName}
              action={
                <Button
                  color="primary"
                  variant="contained"
                  style={{ marginTop: 8, marginRight: 8 }}
                  onClick={onExecute}
                >
                  Execute
                </Button>
              }
            >
              <NewEditor
                content={content}
                workflowURI={workflowURI}
                languageServer={languageServer}
              />
            </InfoCard>
          ) : (
            <Progress />
          )}
        </Grid>
      </Grid>
    </BaseOrchestratorPage>
  );
};
