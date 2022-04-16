import Blockly from "blockly";

export const Solidity = new Blockly.Generator("Solidity");

const objectUtils = Blockly.utils.object;
const stringUtils = Blockly.utils.string;

Solidity.isInitialized = false;

//incomplete list
Solidity.addReservedWords(
  "after,alias,apply,auto,byte,case,copyof,default," +
    "define,final,implements,in,inline,let,macro,match," +
    "mutable,null,of,partial,promise,reference,relocatable,sealed,",
  "sizeof,static,supports,switch,typedef,typeof,var",
  "function,true,false,bool,int8,int,uint8,",
  "uint,address,bytes1,contract,constructor,uint8,",
  "override,virtual,indexed,anonymous,immutable,constant,payable,view,pure,",
  "public,private,external,internal,abi,bytes,block,gasleft,msg,tx,assert,require,",
  "revert,blockhash,keccak256,sha256,ripemd160,ecrecover,addmod,mulmod,this,",
  "super,selfdestruct,type"
);
Solidity.ORDER_ATOMIC = 0; // 0 "" ...
Solidity.ORDER_NEW = 1.1; // new
Solidity.ORDER_MEMBER = 1.2; // . []
Solidity.ORDER_FUNCTION_CALL = 2; // ()
Solidity.ORDER_INCREMENT = 3; // ++
Solidity.ORDER_DECREMENT = 3; // --
Solidity.ORDER_BITWISE_NOT = 4.1; // ~
Solidity.ORDER_UNARY_PLUS = 4.2; // +
Solidity.ORDER_UNARY_NEGATION = 4.3; // -
Solidity.ORDER_LOGICAL_NOT = 4.4; // !
Solidity.ORDER_TYPEOF = 4.5; // typeof
Solidity.ORDER_VOID = 4.6; // void
Solidity.ORDER_DELETE = 4.7; // delete
Solidity.ORDER_DIVISION = 5.1; // /
Solidity.ORDER_MULTIPLICATION = 5.2; // *
Solidity.ORDER_MODULUS = 5.3; // %
Solidity.ORDER_SUBTRACTION = 6.1; // -
Solidity.ORDER_ADDITION = 6.2; // +
Solidity.ORDER_BITWISE_SHIFT = 7; // << >> >>>
Solidity.ORDER_RELATIONAL = 8; // < <= > >=
Solidity.ORDER_IN = 8; // in
Solidity.ORDER_INSTANCEOF = 8; // instanceof
Solidity.ORDER_EQUALITY = 9; // == != === !==
Solidity.ORDER_BITWISE_AND = 10; // &
Solidity.ORDER_BITWISE_XOR = 11; // ^
Solidity.ORDER_BITWISE_OR = 12; // |
Solidity.ORDER_LOGICAL_AND = 13; // &&
Solidity.ORDER_LOGICAL_OR = 14; // ||
Solidity.ORDER_CONDITIONAL = 15; // ?:
Solidity.ORDER_ASSIGNMENT = 16; // = += -= *= /= %= <<= >>= ...
Solidity.ORDER_COMMA = 17; // ,
Solidity.ORDER_NONE = 99; // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array<!Array<number>>}
 */
Solidity.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [Solidity.ORDER_FUNCTION_CALL, Solidity.ORDER_MEMBER],
  // (foo())() -> foo()()
  [Solidity.ORDER_FUNCTION_CALL, Solidity.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [Solidity.ORDER_MEMBER, Solidity.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [Solidity.ORDER_MEMBER, Solidity.ORDER_FUNCTION_CALL],

  // !(!foo) -> !!foo
  [Solidity.ORDER_LOGICAL_NOT, Solidity.ORDER_LOGICAL_NOT],
  // a * (b * c) -> a * b * c
  [Solidity.ORDER_MULTIPLICATION, Solidity.ORDER_MULTIPLICATION],
  // a + (b + c) -> a + b + c
  [Solidity.ORDER_ADDITION, Solidity.ORDER_ADDITION],
  // a && (b && c) -> a && b && c
  [Solidity.ORDER_LOGICAL_AND, Solidity.ORDER_LOGICAL_AND],
  // a || (b || c) -> a || b || c
  [Solidity.ORDER_LOGICAL_OR, Solidity.ORDER_LOGICAL_OR],
];

/**
 * Whether the init method has been called.
 * @type {?boolean}
 */
Solidity.isInitialized = false;

/**
 * Initialise the database of variable names.
 * @param {!Workspace} workspace Workspace to generate code from.
 */
Solidity.init = function (workspace) {
  // Call Blockly.Generator's init.
  Object.getPrototypeOf(this).init.call(this);

  if (!this.nameDB_) {
    this.nameDB_ = new Blockly.Names(this.RESERVED_WORDS_);
  } else {
    this.nameDB_.reset();
  }
  this.nameDB_.setVariableMap(workspace.getVariableMap());
  this.nameDB_.populateVariables(workspace);
  this.nameDB_.populateProcedures(workspace);

  this.isInitialized = true;
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Solidity.finish = function (code) {
  // Convert the definitions dictionary into a list.
  const definitions = objectUtils.values(this.definitions_);
  // Call Blockly.Generator's finish.
  code = Object.getPrototypeOf(this).finish.call(this, code);
  this.isInitialized = false;

  this.nameDB_.reset();

  return definitions.join("\n\n") + "\n\n\n" + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Solidity.scrubNakedValue = function (line) {
  console.log({ line });
  return line + ";\n";
};

/**
 * Encode a string as a properly escaped Solidity string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Solidity string.
 * @protected
 */
Solidity.quote_ = function (string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  string = string
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\\n")
    .replace(/'/g, "\\'");
  return "'" + string + "'";
};

/**
 * Encode a string as a properly escaped multiline Solidity string, complete
 * with quotes.
 * @param {string} string Text to encode.
 * @return {string} Solidity string.
 * @protected
 */
Solidity.multiline_quote_ = function (string) {
  // Can't use goog.string.quote since Google's style guide recommends
  // JS string literals use single quotes.
  const lines = string.split(/\n/g).map(this.quote_);
  return lines.join(" + '\\n' +\n");
};

/**
 * Common tasks for generating Solidity from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Block} block The current block.
 * @param {string} code The Solidity code created for this block.
 * @param {boolean=} opt_thisOnly True to generate code for only this statement.
 * @return {string} Solidity code with comments and subsequent blocks added.
 * @protected
 */
Solidity.scrub_ = function (block, code, opt_thisOnly) {
  let commentCode = "";
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    let comment = block.getCommentText();
    if (comment) {
      comment = stringUtils.wrap(comment, this.COMMENT_WRAP - 3);
      commentCode += this.prefixLines(comment + "\n", "/// ");
    }
    /// Collect comments for all value arguments.
    /// Don't collect comments for nested statements.
    for (let i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type === Blockly.inputTypes.VALUE) {
        const childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          comment = this.allNestedComments(childBlock);
          if (comment) {
            commentCode += this.prefixLines(comment, "/// ");
          }
        }
      }
    }
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = opt_thisOnly ? "" : this.blockToCode(nextBlock);
  console.log({ commentCode, code, nextCode });

  return commentCode + code + nextCode;
};

/**
 * Gets a property and adjusts the value while taking into account indexing.
 * @param {!Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @param {number=} opt_order The highest order acting on this value.
 * @return {string|number}
 */
Solidity.getAdjusted = function (
  block,
  atId,
  opt_delta,
  opt_negate,
  opt_order
) {
  let delta = opt_delta || 0;
  let order = opt_order || this.ORDER_NONE;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  const defaultAtIndex = block.workspace.options.oneBasedIndex ? "1" : "0";

  let innerOrder;
  let outerOrder = order;
  if (delta > 0) {
    outerOrder = this.ORDER_ADDITION;
    innerOrder = this.ORDER_ADDITION;
  } else if (delta < 0) {
    outerOrder = this.ORDER_SUBTRACTION;
    innerOrder = this.ORDER_SUBTRACTION;
  } else if (opt_negate) {
    outerOrder = this.ORDER_UNARY_NEGATION;
    innerOrder = this.ORDER_UNARY_NEGATION;
  }

  let at = this.valueToCode(block, atId, outerOrder) || defaultAtIndex;

  if (stringUtils.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = Number(at) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = at + " + " + delta;
    } else if (delta < 0) {
      at = at + " - " + -delta;
    }
    if (opt_negate) {
      if (delta) {
        at = "-(" + at + ")";
      } else {
        at = "-" + at;
      }
    }
    innerOrder = Math.floor(innerOrder);
    order = Math.floor(order);
    if (innerOrder && order >= innerOrder) {
      at = "(" + at + ")";
    }
  }
  return at;
};
