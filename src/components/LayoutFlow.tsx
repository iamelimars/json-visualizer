/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
} from "reactflow";
import dagre from "dagre";

import { initialNodes, initialEdges } from "./node-edges";

import "reactflow/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: any[], edges: any[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node: { id: any }) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge: { source: any; target: any }) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach(
    (node: {
      id: any;
      targetPosition: string;
      sourcePosition: string;
      position: { x: number; y: number };
    }) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? "left" : "top";
      node.sourcePosition = isHorizontal ? "right" : "bottom";

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      node.position = {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return node;
    }
  );

  return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);

interface Props {
  data: object;
}

const LayoutFlow = ({ data }: Props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const nodeData: Node<any, string | undefined>[] = [];
  function convertJsonToFlowData(jsondata: object) {
    // Handle top level primitives
    const PRIMITIVES = ["string", "number", "boolean"];
    const rootObjectData = Object.entries(jsondata)
      .filter(([_, value]) => {
        return PRIMITIVES.includes(typeof value);
      })
      .reduce((accum, [k, v]) => {
        accum[k] = v;
        return accum;
      }, {});

    nodeData.push({
      id: Math.random().toString(),
      position: { x: 0, y: 0 },
      // type: "jsonNode",
      data: rootObjectData,
    });

    Object.entries(jsondata).forEach(([key, value], index, array) => {
      if (Array.isArray(value)) {
        nodeData.push({
          id: Math.random().toString(),
          position: { x: 0, y: 0 },
          // type: "jsonNode",
          data: `${key} (${value.length})`,
        });

        value.forEach((val) => {
          if (typeof val === "string" || typeof val === "number") {
            nodeData.push({
              id: Math.random().toString(),
              position: { x: 0, y: 0 },
              // type: "jsonNode",
              data: `${val}`,
            });
          } else {
            convertJsonToFlowData(val);
          }
        });
      } else if (typeof value === "object") {
        convertJsonToFlowData(value);
      }
    });
  }

  useEffect(() => {
    convertJsonToFlowData(data);
    setNodes(() => nodeData);
  }, [data, nodeData, setNodes]);

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );
  const onLayout = useCallback(
    (direction: string | undefined) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
    >
      <Panel position="top-right">
        <button onClick={() => onLayout("TB")}>vertical layout</button>
        <button onClick={() => onLayout("LR")}>horizontal layout</button>
      </Panel>
    </ReactFlow>
  );
};

export default LayoutFlow;
