import React from 'react';

import { InfoCard } from '@backstage/core-components';
import { AboutField } from '@backstage/plugin-catalog';

import { Grid } from '@material-ui/core';

import { WorkflowOverview } from '@janus-idp/backstage-plugin-orchestrator-common';

import WorkflowOverviewFormatter from '../../dataFormatters/WorkflowOverviewFormatter';

const WorkflowDefinitionDetailsCard = ({
  workflowOverview,
}: {
  workflowOverview: WorkflowOverview;
}) => {
  const formattedWorkflowOverview = React.useMemo(
    () => WorkflowOverviewFormatter.format(workflowOverview),
    [workflowOverview],
  );
  return (
    <div style={{ maxHeight: '18rem', overflowY: 'auto' }}>
      <InfoCard title="Details">
        <Grid container spacing={3} alignContent="flex-start">
          <Grid container item spacing={3} md={4} alignContent="flex-start">
            <Grid item md={6}>
              <AboutField label="type" value={formattedWorkflowOverview.type} />
            </Grid>
            <Grid item md={6}>
              <AboutField
                label="average duration"
                value={formattedWorkflowOverview.avgDuration}
              />
            </Grid>
            <Grid item md={6}>
              <AboutField
                label="last run"
                value={formattedWorkflowOverview.lastTriggered}
              />
            </Grid>
            <Grid item md={6}>
              <AboutField
                label="last run status"
                value={formattedWorkflowOverview.lastRunStatus}
              />
            </Grid>
          </Grid>
          <Grid item md={8}>
            <AboutField
              label="description"
              value={formattedWorkflowOverview.description}
            />
          </Grid>
        </Grid>
      </InfoCard>
    </div>
  );
};

export default WorkflowDefinitionDetailsCard;
