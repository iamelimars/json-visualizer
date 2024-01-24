import { Fragment } from "react";
import { Handle, Position } from "reactflow";

interface Props {
  data: object;
  targetPosition: Position;
  sourcePosition: Position;
}

// const regex2 = /[{}]/g;

function renderValue(value: string | number | boolean) {
  switch (typeof value) {
    case "string":
      return <span>"{value}"</span>;

    case "number":
      return <span className="text-purple-700">{value}</span>;

    case "boolean":
      return (
        <span className={value ? "text-green-600" : "text-red-600"}>
          {value.toString()}
        </span>
      );

    default:
      return <span>{value}</span>;
  }
}

function JSONNode({ data, targetPosition, sourcePosition }: Props) {
  return (
    <div className="border-4 bg-white max-w-[400px] min-w-[200px] max-h-[200px] flex justify-start items-start overflow-y-scroll">
      <Handle type="target" position={targetPosition} isConnectable={true} />
      {/* <div className="bg-red-50">
        <code>
          <pre>{JSON.stringify(data, null, 2).replace(regex2, "")}</pre>
        </code>
      </div> */}
      <div className="flex flex-col p-4">
        {Object.entries(data).map(([key, value], index) => (
          <Fragment key={key + value}>
            {index < 4 ? (
              <div>
                <span className="text-cyan-900">{key}</span>:{" "}
                {renderValue(value)}
              </div>
            ) : null}
          </Fragment>
        ))}
        {Object.entries(data).length > 4 ? (
          <>
            <button>View More</button>
          </>
        ) : null}
      </div>
      <Handle
        type="source"
        position={sourcePosition}
        id="b"
        isConnectable={true}
      />
    </div>
  );
}

export default JSONNode;
