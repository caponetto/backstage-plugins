import * as React from 'react';

import { Tooltip } from '@patternfly/react-core';
import {
  CogIcon,
  ExpandArrowsAltIcon,
  ServicesIcon,
  SyncAltIcon,
} from '@patternfly/react-icons';
import {
  action,
  createTopologyControlButtons,
  DagreLayout,
  defaultControlButtonsOptions,
  DefaultEdge,
  DefaultNode,
  Edge,
  EdgeModel,
  Graph,
  GraphComponent,
  ModelKind,
  Node,
  observer,
  TopologyControlBar,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  withDragNode,
  WithDragNodeProps,
  withPanZoom,
  WithSelectionProps,
} from '@patternfly/react-topology';

import {
  CALLBACK_NODE,
  COMPENSATE_EDGE,
  END_NODE,
  ERROR_EDGE,
  INJECT_NODE,
  OPERATION_NODE,
  PARALLEL_NODE,
  START_NODE,
  SWITCH_NODE,
  TRANSITION_EDGE,
  useModel,
} from './model';

import './edge.css';
import '@patternfly/patternfly/patternfly.css';
import '@patternfly/patternfly/patternfly-addons.css';

const SelectionContext = React.createContext<{
  selectedNode: string | undefined;
  onNodeSelect: (node: string) => void;
}>({
  selectedNode: undefined,
  onNodeSelect: () => {},
});

type CustomNodeProps = {
  element: Node;
} & WithDragNodeProps &
  WithSelectionProps;

const CustomNode: React.FC<CustomNodeProps> = observer(
  ({ element, ...rest }) => {
    const chartTriggerRef = React.useRef<SVGGElement | null>(null);
    const data = element.getData();

    const { selectedNode, onNodeSelect } = React.useContext(SelectionContext);

    const getIcon = () => {
      switch (element.getType()) {
        case CALLBACK_NODE: {
          return (
            <SyncAltIcon style={{ fill: '#F0AB00' }} width={45} height={45} />
          );
        }
        case SWITCH_NODE: {
          return (
            <ExpandArrowsAltIcon
              style={{ fill: '#3E8635' }}
              width={45}
              height={45}
            />
          );
        }
        default: {
          return <CogIcon style={{ fill: '#0066CC' }} width={45} height={45} />;
        }
      }
    };

    return (
      <DefaultNode
        element={element}
        {...rest}
        selected={selectedNode === element.getId()}
        onSelect={() => onNodeSelect(element.getId())}
      >
        <g transform={`translate(30, 25)`}>{getIcon()}</g>
        {data?.actions && (
          <Tooltip
            content={
              <div>
                {(data.actions as string[]).map(a => (
                  <div key={a}>{`Action name: ${a}`}</div>
                ))}
              </div>
            }
            triggerRef={chartTriggerRef}
          >
            <g ref={chartTriggerRef} transform={`translate(15, 70)`}>
              <ServicesIcon
                style={{ fill: '#838a8f' }}
                width={25}
                height={25}
              />
            </g>
          </Tooltip>
        )}
      </DefaultNode>
    );
  },
);

type CustomEdgeProps = {
  element: Edge<EdgeModel, any>;
};

const CompensateEdge: React.FC<CustomEdgeProps> = props => (
  <DefaultEdge {...props} className="custom-edge--comp" />
);

const ErrorEdge: React.FC<CustomEdgeProps> = props => (
  <DefaultEdge {...props} className="custom-edge--error" />
);

const pipelineComponentFactory = (kind: ModelKind, type: string) => {
  if (kind === ModelKind.graph) {
    return withPanZoom()(GraphComponent);
  }
  switch (type) {
    case OPERATION_NODE:
    case SWITCH_NODE:
    case CALLBACK_NODE:
    case PARALLEL_NODE:
    case INJECT_NODE:
      return withDragNode()(CustomNode) as React.ComponentType<any>;
    case START_NODE:
    case END_NODE:
      return withDragNode()(DefaultNode) as React.ComponentType<any>;
    case TRANSITION_EDGE:
      return DefaultEdge as React.ComponentType<any>;
    case COMPENSATE_EDGE:
      return CompensateEdge as React.ComponentType<any>;
    case ERROR_EDGE:
      return ErrorEdge as React.ComponentType<any>;
    default:
      return undefined;
  }
};

export const NewEditorChart: React.FC<{
  content: string;
  selectedNode: string | undefined;
  onNodeSelect: (node: string) => void;
}> = ({ content, selectedNode, onNodeSelect }) => {
  const { nodes, edges } = useModel(content);

  const controller = React.useMemo(() => {
    const newController = new Visualization();
    newController.setFitToScreenOnLayout(true);
    newController.registerComponentFactory(pipelineComponentFactory);
    newController.registerLayoutFactory(
      (_, graph: Graph) => new DagreLayout(graph),
    );
    return newController;
  }, []);

  React.useEffect(() => {
    const model = {
      nodes,
      edges,
      graph: {
        id: 'g1',
        type: 'graph',
        layout: 'dagre',
      },
    };
    controller.fromModel(model, false);
  }, [nodes, edges, controller]);

  return (
    <SelectionContext.Provider value={{ selectedNode, onNodeSelect }}>
      <TopologyView
        controlBar={
          <TopologyControlBar
            controlButtons={createTopologyControlButtons({
              ...defaultControlButtonsOptions,
              zoomInCallback: action(() => {
                controller.getGraph().scaleBy(4 / 3);
              }),
              zoomOutCallback: action(() => {
                controller.getGraph().scaleBy(0.75);
              }),
              fitToScreenCallback: action(() => {
                controller.getGraph().fit(80);
              }),
              resetViewCallback: action(() => {
                controller.getGraph().reset();
                controller.getGraph().layout();
              }),
              legend: false,
            })}
          />
        }
      >
        <VisualizationProvider controller={controller}>
          <VisualizationSurface />
        </VisualizationProvider>
      </TopologyView>
    </SelectionContext.Provider>
  );
};
