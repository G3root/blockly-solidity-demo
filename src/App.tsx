import { useRef } from "react";
import "./App.css";
import { BlocklyWorkspace } from "react-blockly";
import Blockly from "blockly";
import { Solidity } from "./generators";

Blockly.Blocks["pragma"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("pragma solidity")
      .appendField(new Blockly.FieldTextInput("^0.8.10"), "VALUE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("used to enable certain compiler features or checks");
    this.setHelpUrl(
      "https://docs.soliditylang.org/en/develop/layout-of-source-files.html#pragmas"
    );
  },
};

Blockly.Blocks["spdx"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("// SPDX-License-Identifier:")
      .appendField(new Blockly.FieldTextInput("MIT"), "VALUE");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(105);
    this.setTooltip("");
    this.setHelpUrl(
      "https://docs.soliditylang.org/en/develop/layout-of-source-files.html#spdx-license-identifier"
    );
  },
};

Blockly.Blocks["file"] = {
  init: function () {
    this.appendStatementInput("FILE")
      .setCheck(null)
      .appendField("File Name")
      .appendField(new Blockly.FieldTextInput("Hello World"), "VALUE")
      .appendField(".sol");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.Blocks["contract"] = {
  init: function () {
    this.appendStatementInput("VALUE")
      .appendField("contract")
      .appendField(new Blockly.FieldTextInput("Counter"), "VALUE");
    this.setPreviousStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl(
      "https://docs.soliditylang.org/en/develop/structure-of-a-contract.html#structure-of-a-contract"
    );
  },
};

Solidity["spdx"] = function (block) {
  const value = block.getFieldValue("VALUE");
  const isParentFile = block.getSurroundParent()?.type === "file";
  if (!isParentFile) return "";

  const code = `// SPDX-License-Identifier: ${value} \n`;
  return code;
};

Solidity["pragma"] = function (block) {
  const value = block.getFieldValue("VALUE");
  const isParentFile = block.getSurroundParent()?.type === "file";
  if (!isParentFile) return "";
  const code = `pragma solidity ${value} ; \n`;
  return code;
};

Solidity["contract"] = function (block) {
  const fieldName = block.getFieldValue("VALUE");
  const isParentFile = block.getSurroundParent()?.type === "file";
  if (!isParentFile) return "";
  const code = `contract ${fieldName} {\n\n}`;

  return code;
};

Solidity["file"] = function (block) {
  const value = Solidity.statementToCode(block, "FILE");

  return value;
};

function App() {
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const MY_TOOLBOX = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "Layout",
        colour: "#5C81A6",
        contents: [
          {
            kind: "block",
            type: "pragma",
          },
          {
            kind: "block",
            type: "spdx",
          },
          {
            kind: "block",
            type: "file",
          },
        ],
      },
      {
        kind: "category",
        name: "Structure",
        colour: "#5CA65C",
        contents: [
          {
            kind: "block",
            type: "contract",
          },
        ],
      },
    ],
  };
  function workspaceDidChange(workspace) {
    const code = Solidity.workspaceToCode(workspace);
    if (textAreaRef.current) {
      textAreaRef.current.value = code;
    }
  }
  return (
    <>
      <BlocklyWorkspace
        className="fill-height" // you can use whatever classes are appropriate for your app's CSS
        toolboxConfiguration={MY_TOOLBOX} // this must be a JSON toolbox definition
        onWorkspaceChange={workspaceDidChange}
      />
      <textarea
        id="code"
        style={{ height: "200px", width: "400px" }}
        readOnly
        ref={textAreaRef}
      />
    </>
  );
}

export default App;
