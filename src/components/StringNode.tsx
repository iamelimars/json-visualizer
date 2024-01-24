import { Handle, Position } from "reactflow";

interface Props {
  data: string | number;
  targetPosition: Position;
  sourcePosition: Position;
}

function StringNode({ data, targetPosition, sourcePosition }: Props) {
  return (
    <div className="border-4 bg-white max-w-[200px] max-h-[50px] p-2 flex justify-center items-center">
      <Handle type="target" position={targetPosition} isConnectable={true} />
      <div>{data}</div>
      <Handle
        type="source"
        position={sourcePosition}
        id="b"
        isConnectable={true}
      />
    </div>
  );
}

export default StringNode;
