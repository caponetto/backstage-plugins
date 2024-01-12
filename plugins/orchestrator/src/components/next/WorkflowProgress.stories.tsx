import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { fakeNodeInstances } from '../../__fixtures__/fakeNodeInstances';
import { WorkflowProgress } from './WorkflowProgress';

const meta = {
  title: 'Orchestrator/next/WorkflowProgress',
  component: WorkflowProgress,
  decorators: [Story => <Story />],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['ACTIVE', 'COMPLETED', 'ABORTED', 'SUSPENDED', 'ERROR'],
    },
    error: {
      control: 'object',
    },
  },
} satisfies Meta<typeof WorkflowProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SampleStory: Story = {
  name: 'Sample',
  args: {
    nodes: fakeNodeInstances,
    status: 'ACTIVE',
  },
};
