import "reactflow/dist/style.css";
import { FlowGraph } from "./components/FlowGraph";
import { Sidebar } from "./components/Sidebar";
import { useState } from "react";

const defaultJson = {
  squadName: "Super hero squad",
  homeTown: "Metro City",
  formed: 2016,
  secretBase: "Super tower",
  active: true,
  objectTwo: {
    nested2: "dataTwo",
    nestedd2: "dataTwo",
  },
  members: [
    {
      name: "Molecule Man",
      age: 29,
      secretIdentity: "Dan Jukes",
      powers: ["Radiation resistance", "Turning tiny", "Radiation blast"],
    },
    {
      name: "Madame Uppercut",
      age: 39,
      secretIdentity: "Jane Wilson",
      powers: [
        "Million tonne punch",
        "Damage resistance",
        "Superhuman reflexes",
      ],
    },
    {
      name: "Eternal Flame",
      age: 1000000,
      secretIdentity: "Unknown",
      powers: [
        "Immortality",
        "Heat Immunity",
        "Inferno",
        "Teleportation",
        "Interdimensional travel",
      ],
    },
  ],
  objectOne: {
    nested: "data",
    nestedd: "data",
  },
};

export default function App() {
  const [jsonData, setJsonData] = useState<object>(defaultJson);
  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="w-full h-screen grid grid-cols-[min-content_auto]"
      // className="grid grid-cols-3"
    >
      {/* <div className="col-span-1">
        <h1>JSON container</h1>
      </div> */}
      <Sidebar data={jsonData} setData={setJsonData} />
      <div>
        <FlowGraph data={jsonData} />
        {/* <LayoutFlow /> */}
      </div>
    </div>
  );
}

// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
// import "./App.css";
// import { LinkGraph } from "./components/LinkGraph";
// import ParentSize from "@visx/responsive/lib/components/ParentSize";
// import TreeGraph from "./components/TreeGraph";

// function App() {
//   return (
//     <div>
//       <div>
//         <a href="https://vitejs.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>JSON Visualizer</h1>
//       {/* <ParentSize>
//         {({ width, height }) => <LinkGraph width={width} height={height} />}
//       </ParentSize> */}
//       <LinkGraph width={800} height={600} />
//       <TreeGraph width={800} height={600} />
//       {/* <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p> */}
//     </div>
//   );
// }

// export default App;
