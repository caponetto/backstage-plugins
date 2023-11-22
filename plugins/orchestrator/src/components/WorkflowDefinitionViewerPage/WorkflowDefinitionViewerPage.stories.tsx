import React from 'react';

import { TestApiProvider, wrapInTestApp } from '@backstage/test-utils';

import { Meta, StoryObj } from '@storybook/react';

import {
  WorkflowItem,
  WorkflowOverview,
} from '@janus-idp/backstage-plugin-orchestrator-common';

import { orchestratorApiRef } from '../../api';
import { orchestratorRootRouteRef } from '../../routes';
import { WorkflowDefinitionViewerPage } from './WorkflowDefinitionViewerPage';

const mockWorkflowItem: WorkflowItem = {
  definition: {
    id: 'sample.workflow',
    version: '1.0.0',
    specVersion: '1.0.1',
    name: 'Sample workflow',
    states: [{}],
  },
  uri: 'sample.workflow.sw.yaml',
};

const workflowOverview: WorkflowOverview = {
  workflowId: '123',
  name: 'Sample Workflow',
  lastTriggeredMs: 1697276096000,
  lastRunStatus: 'Success',
  type: 'Sample Type',
  avgDurationMs: 150000,
  description: 'Sample description',
  uri: 'sample.workflow.sw.yaml',
};

const meta = {
  title: 'Orchestrator/workflow viewer page',
  component: WorkflowDefinitionViewerPage,
  decorators: [
    (Story, context) => {
      const api = {
        getWorkflowOverview: () =>
          Promise.resolve(
            (context.args as { workflowOverview: WorkflowOverview })
              .workflowOverview,
          ),
        getWorkflow(_workflowId: string): Promise<WorkflowItem> {
          return Promise.resolve(mockWorkflowItem);
        },
      };
      return wrapInTestApp(
        <TestApiProvider apis={[[orchestratorApiRef, api]]}>
          <Story />
        </TestApiProvider>,
        {
          mountedRoutes: {
            '/orchestrator': orchestratorRootRouteRef,
          },
        },
      );
    },
  ],
} satisfies Meta<typeof WorkflowDefinitionViewerPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowDefinitionViewerPageStory: Story = {
  name: 'Has running workflows',
  args: {
    workflowOverview,
  },
};

export const NoRunningWorkflows: Story = {
  name: 'No running workflows',
  args: {
    workflowOverview: {
      id: 'sample.workflow',
      name: 'Sample workflow',
      type: 'Sample type',
      uri: 'sample.workflow.sw.yaml',
      description: 'test description',
    },
  },
};

export const LongDesription: Story = {
  name: 'Long description',
  args: {
    workflowOverview: {
      id: 'sample.workflow',
      name: 'Sample workflow',
      type: 'Sample type',
      uri: 'sample.workflow.sw.yaml',
      description: `Ingredients:

      2 cups all-purpose flour
      1 1/2 teaspoons baking powder
      1/2 teaspoon baking soda
      1/2 teaspoon salt
      1 teaspoon ground cinnamon
      1/2 teaspoon ground nutmeg
      1/2 cup unsalted butter, softened
      1 cup granulated sugar
      1/2 cup brown sugar, packed
      2 large eggs
      2 teaspoons vanilla extract
      1/2 cup sour cream
      2 cups apples, peeled and diced (such as Granny Smith)
      1/2 cup chopped nuts (optional)
      Powdered sugar for dusting (optional)
      Instructions:
      
      Preheat your oven to 350°F (175°C). Grease and flour a 9x13-inch baking pan.
      In a medium bowl, whisk together the flour, baking powder, baking soda, salt, cinnamon, and nutmeg. Set aside.
      In a large bowl, cream together the softened butter, granulated sugar, and brown sugar until light and fluffy.
      Beat in the eggs one at a time, then stir in the vanilla extract.
      Gradually add the dry ingredients to the wet ingredients, mixing until just combined.
      Fold in the sour cream, followed by the diced apples and nuts (if using).
      Spread the batter evenly in the prepared baking pan.
      Bake for 40-45 minutes or until a toothpick inserted into the center comes out clean.
      Allow the cake to cool in the pan for 10 minutes, then transfer it to a wire rack to cool completely.
      Optionally, dust the cooled cake with powdered sugar before serving.
      Enjoy your delicious homemade apple cake!
      Certainly! Here's a simple recipe for making an apple cake:

          Ingredients:

          2 cups all-purpose flour
          1 1/2 teaspoons baking powder
          1/2 teaspoon baking soda
          1/2 teaspoon salt
          1 teaspoon ground cinnamon
          1/2 teaspoon ground nutmeg
          1/2 cup unsalted butter, softened
          1 cup granulated sugar
          1/2 cup brown sugar, packed
          2 large eggs
          2 teaspoons vanilla extract
          1/2 cup sour cream
          2 cups apples, peeled and diced (such as Granny Smith)
          1/2 cup chopped nuts (optional)
          Powdered sugar for dusting (optional)
          Instructions:

          Preheat your oven to 350°F (175°C). Grease and flour a 9x13-inch baking pan.
          In a medium bowl, whisk together the flour, baking powder, baking soda, salt, cinnamon, and nutmeg. Set aside.
          In a large bowl, cream together the softened butter, granulated sugar, and brown sugar until light and fluffy.
          Beat in the eggs one at a time, then stir in the vanilla extract.
          Gradually add the dry ingredients to the wet ingredients, mixing until just combined.
          Fold in the sour cream, followed by the diced apples and nuts (if using).
          Spread the batter evenly in the prepared baking pan.
          Bake for 40-45 minutes or until a toothpick inserted into the center comes out clean.
          Allow the cake to cool in the pan for 10 minutes, then transfer it to a wire rack to cool completely.
          Optionally, dust the cooled cake with powdered sugar before serving.
          Enjoy your delicious homemade apple cake!`,
    },
  },
};
