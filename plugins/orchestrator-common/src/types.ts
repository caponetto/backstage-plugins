import { Specification } from '@severlessworkflow/sdk-typescript';
import { JSONSchema4 } from 'json-schema';
import { OpenAPIV3 } from 'openapi-types';

type Id<T> = { [P in keyof T]: T[P] };

type OmitDistributive<T, K extends PropertyKey> = T extends any
  ? T extends object
    ? Id<OmitRecursively<T, K>>
    : T
  : never;

export type OmitRecursively<T, K extends PropertyKey> = Omit<
  { [P in keyof T]: OmitDistributive<T[P], K> },
  K
>;

export type WorkflowDefinition = OmitRecursively<
  Specification.Workflow,
  'normalize'
>;

export interface WorkflowItem {
  uri: string;
  definition: WorkflowDefinition;
}

export type WorkflowListResult = {
  items: WorkflowItem[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type WorkflowOverviewListResult = {
  items: WorkflowOverview[];
  totalCount: number;
  offset: number;
  limit: number;
};

export type WorkflowFormat = 'yaml' | 'json';

export interface WorkflowSample {
  id: string;
  url: string;
}

export interface WorkflowSpecFile {
  path: string;
  content: OpenAPIV3.Document;
}

export type WorkflowDataInputSchema = JSONSchema4 & {
  components: {
    schemas: {
      [key: string]: OpenAPIV3.NonArraySchemaObject;
    };
  };
};

export interface WorkflowDataInputSchemaResponse {
  workflowItem: WorkflowItem;
  schema: WorkflowDataInputSchema | undefined;
}

export interface WorkflowExecutionResponse {
  id: string;
}

export enum WorkflowCategory {
  ASSESSMENT = 'assessment',
  INFRASTRUCTURE = 'infrastructure',
}

export interface WorkflowOverview {
  name?: string;
  lastTriggered: Date;
  lastRunStatus: string;
  type: string;
  avgDurationMs: number;
  documentation?: string;
}
