import { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-dracula";
import "ace-builds/src-noconflict/ext-language_tools";

const [minWidth, maxWidth, defaultWidth] = [200, 500, 350];
interface Props {
  data: object;
  setData: React.Dispatch<React.SetStateAction<object>>;
}

export const Sidebar = ({ data, setData }: Props) => {
  const siebarWidth = localStorage.getItem("sidebarWidth");
  const [width, setWidth] = useState(
    siebarWidth ? parseInt(siebarWidth) : defaultWidth
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isResized = useRef(false);

  useEffect(() => {
    window.addEventListener("mousemove", (e) => {
      if (!isResized.current) {
        return;
      }

      document.body.style.userSelect = "none";

      setWidth((previousWidth) => {
        const newWidth = previousWidth + e.movementX / 2;

        const isWidthInRange = newWidth >= minWidth && newWidth <= maxWidth;

        return isWidthInRange ? newWidth : previousWidth;
      });
    });

    window.addEventListener("mouseup", () => {
      document.body.style.userSelect = "auto";
      isResized.current = false;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarWidth", `${width}`);
  }, [width]);

  function onCodeChange(newValue: string) {
    try {
      const parsedJson = JSON.parse(newValue);
      setData(parsedJson);
      // console.log("change", newValue);
      // console.log("parsed change", parsedJson);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Invalid Json");
    }
  }

  return (
    <div className="flex relative">
      <div style={{ width: `${width / 16}rem` }} className="flex flex-col">
        <div className="flex justify-between p-4">
          <h1>JSON visualizer</h1>
          {errorMessage ? (
            // <div className="absolute bottom-2 left-1 right-2 rounded-sm bg-slate-600 z-10 p-4">
            <h1 className="text-red-500">{errorMessage}</h1>
          ) : // </div>
          null}
        </div>
        <AceEditor
          mode="json"
          theme="dracula"
          onChange={onCodeChange}
          onPaste={onCodeChange}
          name="UNIQUE_ID_OF_DIV"
          editorProps={{ $blockScrolling: true }}
          style={{ width: "100%", height: "100%" }}
          defaultValue={JSON.stringify(data, null, 2)}
          enableBasicAutocompletion
          onValidate={(annotations) => console.log(annotations)}
        />
      </div>
      {/* Handle */}
      <div
        className="w-1 cursor-col-resize bg-gray-300"
        onMouseDown={() => {
          isResized.current = true;
        }}
      />
    </div>
  );
};
