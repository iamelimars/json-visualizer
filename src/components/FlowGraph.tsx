/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  ConnectionLineType,
  NodeTypes,
  Position,
} from "reactflow";

import "reactflow/dist/style.css";
import JSONNode from "./JSONNode";
import dagre from "dagre";
import StringNode from "./StringNode";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// const nodeWidth = 172;
// const nodeHeight = 36;
const nodeWidth = 200;
const nodeHeight = 200;

const stringNodeWidth = 200;
const stringNodeHeight = 36;
// const stringNodeWidth = 200;
// const stringNodeHeight = 50;

const edgeType = "smoothstep";

const getLayoutedElements = (nodes: any[], edges: any[], direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({
    rankdir: direction,
    // nodesep: 80,
    // edgesep: 30,
    ranker: "tight-tree",
  });

  nodes.forEach((node: Node) => {
    if (typeof node.data === "object") {
      dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setNode(node.id, {
        width: stringNodeWidth,
        height: stringNodeHeight,
      });
    }
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
      data: any;
    }) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? "left" : "top";
      node.sourcePosition = isHorizontal ? "right" : "bottom";

      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      if (typeof node.data === "object") {
        node.position = {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        };
      } else {
        node.position = {
          x: nodeWithPosition.x - stringNodeWidth / 2,
          y: nodeWithPosition.y - stringNodeHeight / 2,
        };
      }

      return node;
    }
  );

  return { nodes, edges };
};

const nodeTypes: NodeTypes = {
  jsonNode: JSONNode,
  stringNode: StringNode,
} as NodeTypes;

interface Props {
  data: object;
}

export function FlowGraph({ data }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [flow, setFlow] = useState<any>(null);

  useEffect(() => {
    /*
    1. Loop through top level JSON data
    2. Make 1 node for all primitive types
    3. If there is an array at the top level, recursively call the function again for each value in the array
      3b. Make a node with "${key} (${value.length})"
    4. If there is an object at the top level, recursively call the function with that value

    */
    const edgeData: Edge[] = [];
    const nodeData: Node<any, string | undefined>[] = [];
    // TODO: Fix error where if the value is an object and it is before the array, it will skip the object
    function convertJsonToFlowData(jsondata: object, rootParentID?: string) {
      // Handle top level primitives
      const PRIMITIVES = ["string", "number", "boolean"];
      const rootObjectData = Object.entries(jsondata)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => {
          return PRIMITIVES.includes(typeof value);
        })
        .reduce((accum: unknown, [k, v]) => {
          // @ts-expect-error
          accum[k] = v;
          return accum;
        }, {});

      let topLevelId: string;
      if (Object.keys(rootObjectData as object).length !== 0) {
        topLevelId = Math.random().toString();
        nodeData.push({
          id: topLevelId,
          position: { x: 0, y: 0 },
          type: "jsonNode",
          data: rootObjectData,
          // targetPosition: Position.Bottom
        });

        if (rootParentID) {
          edgeData.push({
            id: Math.random().toString(),
            source: rootParentID,
            target: topLevelId,
            type: edgeType,
            animated: true,
          });
        }
      }

      let parentId: string;
      Object.entries(jsondata).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          parentId = Math.random().toString();
          nodeData.push({
            id: parentId,
            position: { x: 0, y: 0 },
            // type: "stringNode",
            // data: `${key} (${value.length})`,
            data: { label: `${key} (${value.length})` },
          });
          if (topLevelId) {
            edgeData.push({
              id: Math.random().toString(),
              source: topLevelId,
              target: parentId,
              type: edgeType,
              animated: true,
            });
          }

          value.forEach((val) => {
            if (typeof val === "string" || typeof val === "number") {
              const nodeId = Math.random().toString();
              nodeData.push({
                id: nodeId,
                position: { x: 0, y: 0 },
                // type: "stringNode",
                data: { label: `${val}` },
              });
              edgeData.push({
                id: Math.random().toString(),
                source: parentId,
                target: nodeId,
                type: edgeType,
                animated: true,
              });
            } else {
              convertJsonToFlowData(val, parentId);
            }
          });
        } else if (typeof value === "object") {
          const nodeId = Math.random().toString();
          if (Object.keys(rootObjectData as object).length !== 0) {
            nodeData.push({
              id: nodeId,
              position: { x: 0, y: 0 },
              data: { label: `${key}` },
            });
            edgeData.push({
              id: Math.random().toString(),
              source: rootParentID ?? topLevelId,
              target: nodeId,
              type: edgeType,
              animated: true,
            });
          }

          convertJsonToFlowData(value, nodeId);
        }
      });
    }

    // function setEdgeData() {
    //   const newEdgeData: Edge[] = nodeData.reduce(
    //     (prevValue: Edge[], currentValue, index, arr) => {
    //       const currentElemment = currentValue;
    //       // const prevElement = arr[index - 1];
    //       const nextElement = arr[index + 1];

    //       if (!nextElement) {
    //         return prevValue;
    //       }

    //       prevValue.push({
    //         id: Math.random().toString(),
    //         source: currentElemment.id,
    //         target: nextElement.id,
    //         type: edgeType,
    //         animated: true,
    //       });
    //       return prevValue;
    //     },
    //     []
    //   );

    //   return newEdgeData;
    // }

    convertJsonToFlowData(data);
    // const newEdgeData = setEdgeData();

    console.log(edgeData);

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodeData,
      edgeData
      // newEdgeData
    );

    setNodes(() => layoutedNodes);
    setEdges(() => layoutedEdges);
  }, [data, setEdges, setNodes]);

  const onLayout = useCallback(
    (direction: string | undefined) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => {
          flow?.fitView({
            duration: 300,
            padding: 1,
          });
          onNodesChange(changes);
        }}
        onEdgesChange={(changes) => {
          onEdgesChange(changes);
        }}
        onConnect={onConnect}
        onInit={setFlow}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        autoPanOnConnect
        autoPanOnNodeDrag
        autoFocus
        nodeTypes={nodeTypes}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
        <Panel position="top-right">
          <button onClick={() => onLayout("TB")}>vertical layout</button>
          <button onClick={() => onLayout("LR")}>horizontal layout</button>
        </Panel>
      </ReactFlow>
    </>
  );
}

// function positionNodeData() {
//   // console.log(nodeData);
//   const newData = nodeData.map((value, index, arr) => {
//     // console.log({ value, index });
//     if (index === 0) return value;
//     const prevValue = arr[index - 1];
//     // console.log("prevValue", prevValue);
//     // console.log(arr);

//     return {
//       ...value,
//       position: {
//         x: prevValue.position.x + 300,
//         y: prevValue.position.y + 300,
//       },
//     };
//   });

//   const dataaa = nodeData.reduce((prevValue, currentValue, index, arr) => {
//     if (index === 0) {
//       prevValue.push(currentValue);
//       return prevValue;
//     }
//     // console.log(prevValue, currentValue, currentIndex, arr);
//     // console.log(JSON.stringify(currentValue));
//     // console.log(JSON.stringify(prevValue));
//     const prevItem = prevValue[index - 1];

//     const newItem: Node = {
//       ...currentValue,
//       position: {
//         x: prevItem.position.x + 300,
//         y: 0,
//         // y: prevItem.position.y + 300,
//       },
//     };

//     prevValue.push(newItem);
//     console.log(prevValue);

//     return prevValue;
//   }, []);

//   return dataaa;
// }
