import React, { useState } from 'react';

import { ContentHeader } from '@backstage/core-components';

import { Grid } from '@material-ui/core';

import { ProcessInstance } from '@janus-idp/backstage-plugin-orchestrator-common';

import { BaseOrchestratorPage } from '../BaseOrchestratorPage/BaseOrchestratorPage';
import { OrchestratorSupportButton } from '../OrchestratorSupportButton/OrchestratorSupportButton';
import { AssessmentResultViewer } from './AssessmentResultViewer';
import { ProcessDetailsViewer } from './ProcessDetailsViewer';
import { ProcessGraphViewer } from './ProcessGraphViewer';
import { ProcessInstancesTable } from './ProcessInstancesTable';
import { ProcessJobs } from './ProcessJobs';
import { ProcessTimeline } from './ProcessTimeline';
import { ProcessVariablesViewer } from './ProcessVariablesViewer';

export const WorkflowInstancesViewerPage = () => {
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance>();

  return (
    <BaseOrchestratorPage>
      <ContentHeader title="Instances">
        <OrchestratorSupportButton />
      </ContentHeader>
      <Grid container direction="row">
        <Grid item xs={12} lg={8}>
          <ProcessInstancesTable
            selectedInstance={selectedInstance}
            setSelectedInstance={setSelectedInstance}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <ProcessGraphViewer
            workflowId={selectedInstance?.processId}
            selectedInstance={selectedInstance}
          />
        </Grid>
        <Grid item xs={12} lg={8}>
          <Grid container direction="row">
            <Grid item xs={12}>
              <ProcessVariablesViewer variables={selectedInstance?.variables} />
            </Grid>
            <Grid item xs={12}>
              <AssessmentResultViewer selectedInstance={selectedInstance} />
            </Grid>
            <Grid item xs={12}>
              <ProcessTimeline selectedInstance={selectedInstance} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Grid container direction="row">
            <Grid item xs={12}>
              <ProcessDetailsViewer selectedInstance={selectedInstance} />
            </Grid>
            <Grid item xs={12}>
              <ProcessJobs selectedInstance={selectedInstance} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </BaseOrchestratorPage>
  );
};
