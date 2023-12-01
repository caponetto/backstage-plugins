import * as React from 'react';

import {
  EdgeModel,
  EdgeStyle,
  NodeModel,
  NodeShape,
} from '@patternfly/react-topology';
import { Databasedswitchstate } from '@severlessworkflow/sdk-typescript/lib/definitions/databasedswitchstate';
import { End } from '@severlessworkflow/sdk-typescript/lib/definitions/end';
import { Enddatacondition } from '@severlessworkflow/sdk-typescript/lib/definitions/enddatacondition';
import { Error } from '@severlessworkflow/sdk-typescript/lib/definitions/error';
import { Transition } from '@severlessworkflow/sdk-typescript/lib/definitions/transition';
import { Transitiondatacondition } from '@severlessworkflow/sdk-typescript/lib/definitions/transitiondatacondition';
import { Workflow } from '@severlessworkflow/sdk-typescript/lib/definitions/workflow';

import {
  fromWorkflowSource,
  OmitRecursively,
  WorkflowDefinition,
} from '@janus-idp/backstage-plugin-orchestrator-common';

export const START_NODE = 'START_NODE';
export const END_NODE = 'END_NODE';
export const OPERATION_NODE = 'OPERATION_NODE';
export const CALLBACK_NODE = 'CALLBACK_NODE';
export const SWITCH_NODE = 'SWITCH_NODE';
export const PARALLEL_NODE = 'PARALLEL_NODE';
export const INJECT_NODE = 'INJECT_NODE';

export const TRANSITION_EDGE = 'TRANSITION_EDGE';
export const COMPENSATE_EDGE = 'COMPENSATE_EDGE';
export const ERROR_EDGE = 'ERROR_EDGE';

const getTransitionTarget = (
  transition: string | OmitRecursively<Transition, 'normalize'> | undefined,
): string | undefined => {
  if (typeof transition === 'string') {
    return transition;
  }
  return transition?.nextState;
};

const getStartTarget = (start: Workflow['start']): string | undefined => {
  if (typeof start === 'string') {
    return start;
  }
  return start?.stateName;
};

const handleCompensatedBy = (
  state: { name?: string; compensatedBy?: string },
  edges: EdgeModel[],
) => {
  if (state.compensatedBy) {
    edges.push({
      id: `edge-${state.name}-${state.compensatedBy}`,
      type: COMPENSATE_EDGE,
      source: state.name,
      target: state.compensatedBy,
      edgeStyle: EdgeStyle.dashedMd,
    });
  }
};

const handleTransition = (
  state: {
    name?: string;
    transition?: string | OmitRecursively<Transition, 'normalize'> | undefined;
  },
  edges: EdgeModel[],
) => {
  if (state.transition) {
    const target = getTransitionTarget(state.transition);
    edges.push({
      id: `edge-${state.name}-${target}`,
      type: TRANSITION_EDGE,
      source: state.name,
      target,
    });
  }
};

const handleEnd = (
  state: {
    name?: string;
    end?: boolean | OmitRecursively<End, 'normalize'> | undefined;
  },
  edges: EdgeModel[],
  nodes: NodeModel[],
) => {
  if (state.end) {
    nodes.push({
      id: `end-${state.name}`,
      type: END_NODE,
      label: 'End',
      width: 75,
      height: 75,
      shape: NodeShape.ellipse,
      style: {
        padding: [45, 15],
      },
    });
    edges.push({
      id: `edge-${state.name}-end`,
      type: TRANSITION_EDGE,
      source: state.name,
      target: `end-${state.name}`,
    });
  }
};

const handleOnErrors = (
  state: { name?: string; onErrors?: OmitRecursively<Error[], 'normalize'> },
  edges: EdgeModel[],
) => {
  state.onErrors?.forEach(error => {
    const target = getTransitionTarget(error.transition);
    edges.push({
      id: `edge-${state.name}-${target}`,
      type: ERROR_EDGE,
      source: state.name,
      target: target,
      edgeStyle: EdgeStyle.dashedMd,
    });
  });
};

export const useModel = (content: string) => {
  const [workflow, setWorkflow] = React.useState<WorkflowDefinition>();

  React.useEffect(() => {
    try {
      setWorkflow(fromWorkflowSource(content));
    } catch (e) {
      console.error(e);
    }
  }, [content]);

  return React.useMemo(() => {
    const nodes: NodeModel[] = [];
    const edges: EdgeModel[] = [];

    const startTarget = getStartTarget(workflow?.start);

    if (startTarget) {
      const nodeId = `start-${startTarget}`;
      nodes.push({
        id: nodeId,
        type: START_NODE,
        label: 'Start',
        width: 75,
        height: 75,
        shape: NodeShape.ellipse,
        style: {
          padding: [45, 15],
        },
      });
      edges.push({
        id: `edge-${nodeId}-${startTarget}`,
        type: TRANSITION_EDGE,
        source: nodeId,
        target: startTarget,
      });
    }

    workflow?.states
      .filter(state => state.name)
      .forEach(state => {
        switch (state.type) {
          case 'operation': {
            nodes.push({
              id: state.name || '',
              type: OPERATION_NODE,
              label: state.name,
              width: 100,
              height: 100,
              shape: NodeShape.rect,
              style: {
                padding: [45, 15],
              },
            });
            handleTransition(state, edges);
            handleCompensatedBy(state, edges);
            handleOnErrors(state, edges);
            handleEnd(state, edges, nodes);
            break;
          }
          case 'switch': {
            nodes.push({
              id: state.name,
              type: SWITCH_NODE,
              label: state.name,
              width: 100,
              height: 100,
              shape: NodeShape.rect,
              style: {
                padding: [45, 15],
              },
            });

            const target = getTransitionTarget(
              state.defaultCondition.transition,
            );
            edges.push({
              id: `edge-${state.name}-${target}`,
              type: TRANSITION_EDGE,
              source: state.name,
              target,
            });

            handleCompensatedBy(state, edges);
            handleOnErrors(state, edges);

            (state as Databasedswitchstate).dataConditions?.forEach(dc => {
              let target: string | undefined;
              if ((dc as Enddatacondition).end) {
                target = `end-${state.name}`;
                nodes.push({
                  id: target,
                  type: END_NODE,
                  label: 'End',
                  width: 75,
                  height: 75,
                  shape: NodeShape.ellipse,
                  style: {
                    padding: [45, 15],
                  },
                });
              } else {
                target = getTransitionTarget(
                  (dc as Transitiondatacondition).transition,
                );
              }

              if (target) {
                edges.push({
                  id: `edge-switch-${state.name}-${target}`,
                  type: TRANSITION_EDGE,
                  source: state.name,
                  target,
                });
              }
            });
            break;
          }
          case 'callback': {
            nodes.push({
              id: state.name || '',
              type: CALLBACK_NODE,
              label: state.name,
              width: 100,
              height: 100,
              shape: NodeShape.rect,
              style: {
                padding: [45, 15],
              },
            });
            handleEnd(state, edges, nodes);
            handleTransition(state, edges);
            handleCompensatedBy(state, edges);
            handleOnErrors(state, edges);
            break;
          }
          case 'parallel': {
            nodes.push({
              id: state.name || '',
              type: PARALLEL_NODE,
              label: state.name,
              width: 100,
              height: 100,
              shape: NodeShape.rect,
              style: {
                padding: [45, 15],
              },
            });
            handleEnd(state, edges, nodes);
            handleTransition(state, edges);
            handleCompensatedBy(state, edges);
            handleOnErrors(state, edges);
            break;
          }
          case 'inject': {
            nodes.push({
              id: state.name || '',
              type: INJECT_NODE,
              label: state.name,
              width: 100,
              height: 100,
              shape: NodeShape.rect,
              style: {
                padding: [45, 15],
              },
            });
            handleTransition(state, edges);
            handleEnd(state, edges, nodes);
            handleCompensatedBy(state, edges);
            break;
          }
          default: {
            nodes.push({
              id: state.name || '',
              type: OPERATION_NODE,
              label: state.name,
              width: 100,
              height: 100,
              shape: NodeShape.rect,
              style: {
                padding: [45, 15],
              },
            });
            handleEnd(state, edges, nodes);
            handleCompensatedBy(state, edges);
            handleTransition(state, edges);
          }
        }
      });

    const validEdges = edges.filter(e => nodes.some(n => n.id === e.target));
    return { nodes, edges: validEdges };
  }, [workflow]);
};
