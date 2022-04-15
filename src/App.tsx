import { useRef } from "react";
import "./App.css";
import { BlocklyWorkspace } from "react-blockly";
import Blockly from "blockly";

Blockly.Blocks["pragma"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("pragma solidity")
      .appendField(new Blockly.FieldTextInput("^0.8.10"), "VALUE");
    this.setInputsInline(false);
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
      .appendField("File Name")
      .appendField(new Blockly.FieldTextInput("Hello World"), "VALUE");
    this.setColour(30);
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

Blockly.JavaScript["spdx"] = function (block) {
  const value = block.getFieldValue("VALUE");

  const code = `// SPDX-License-Identifier: ${value} \n`;
  return code;
};

Blockly.JavaScript["pragma"] = function (block) {
  const value = block.getFieldValue("VALUE");

  const code = `pragma solidity ${value} ; \n`;
  return code;
};

Blockly.JavaScript["contract"] = function (block) {
  const fieldName = block.getFieldValue("VALUE");
  const value = Blockly.JavaScript.statementToCode(block, "VALUE");

  const code = `contract ${fieldName} {\n\n}`;

  return code;
};

Blockly.JavaScript["file"] = function (block) {
  const value = Blockly.JavaScript.statementToCode(block, "FILE");
  console.log(value);

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
    const code = Blockly.JavaScript.workspaceToCode(workspace);
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
