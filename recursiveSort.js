const inputStringValue =
  '\n' +
  '#D Heading' +
  '\n' +
  'D Headingo biski teksto siaip sau' +
  '\n' +
  'D Headingo biski teksto siaip sau XXX' +
  '\n' +
  '##DC Heading' +
  '\n' +
  'DC Headingo biski teksto' +
  '\n' +
  'Ir dar biski' +
  '\n' +
  '##DA Heading' +
  '\n' +
  'DA Tekstas' +
  '\n' +
  '##DB Heading' +
  '\n' +
  '###DBA Heading' +
  '\n' +
  'DBA Tekstuko ' +
  '\n' +
  '#C Heading' +
  '\n' +
  '##CB Heading' +
  '\n' +
  '###CBB Heading' +
  '\n' +
  'CBB Tekstas' +
  '\n' +
  '###CBA Heading' +
  '\n' +
  'CBA Tekstas' +
  '\n' +
  '##CA Heading' +
  '\n' +
  '###CAZ Heading' +
  '\n' +
  'CAZ Tekstas' +
  '\n';

function Node(value, textValue = '', simpleText = '') {
  this.value = value; // Heading value, for example: "# Main Heading" or "### Sub sub Heading"
  this.simpleText = simpleText; // Text that is under heading but not subheading
  this.textValue = textValue; // All remaining text that is under current Heading
  this.children = []; // Current heading subheadings, example: heading "# Main heading" has two subheadings: "## Introduction" and "## Sumary"
  this.parent = null;

  this.setParentNode = function (node) {
    this.parent = node;
  };

  this.addChild = function (node) {
    node.setParentNode(this);
    this.children[this.children.length] = node;
  };

  this.setChildren = function (children) {
    this.children = children;
  };

  this.getChildren = function () {
    return this.children;
  };

  this.getSimpleText = function () {
    return this.simpleText;
  };

  this.getTextValue = function () {
    return this.textValue;
  };

  this.getValue = function () {
    return this.value;
  };

  this.setSimpleText = function (simpleTextValue) {
    this.simpleText = simpleTextValue;
  };
}

/**
 * @param inputString - string in which we are looking for #headings
 * @param splitter - element by which we split all text into lines (in our case it is new line symbol \n
 * @param parentNode - we have to have parent node to be able to connect children to it
 * @param depthNumber - for how many heading indicators we are looking (# or ## and so on)
 */
const setNodes = (inputString, splitter, parentNode, depthNumber) => { // Main function that converts input string into tree of nodes
  const splitString = inputString.split(splitter); // Splitting input string into lines and saving them into an array
  const separator = '#';
  for (let i = 0; i < splitString.length; i += 1) { // Going throughout all lines
    const line = splitString[i]; // Setting current iteration value

    // Checking if current line is heading that we are looking for. Checking if line starts with as many separators as it has to
    // and whether that line has empty lines before and after that (it was described in requirements)
    if (line.slice(0, depthNumber) === separator.repeat(depthNumber) && line[depthNumber] !== separator && splitString[i - 1] === '\n' && splitString[i + 1] === '\n') {
      let headingString = splitString[i + 1]; // Setting next line value
      for (let j = i + 1; j < splitString.length; j += 1) { // Going throughout all next lines
        const line2 = splitString[j]; // Setting current iteration value

        // Checking where current heading ends and new one starts
        if (line2.slice(0, depthNumber) === separator.repeat(depthNumber) && line2[depthNumber] !== separator && splitString[j - 1] === '\n' && splitString[j + 1] === '\n') {
          // If new heading starting the we add up to first iterator to not go through same lines again and break the current cycle
          i = j - 1;
          break;
        } else {
          // If it's still not new heading we adding up to have string with all current heading info
          headingString += line2;
        }
      }
      // If current heading doesn't have his own text and exactly after it goes subheading then we adding as much new lines as there has to be
      const x = headingString.search(`\n${separator.repeat(depthNumber + 1)}`);
      let simpleText = '';
      if (x > -1) {
        simpleText = headingString.slice(0, x);
      }
      // Creating new node which
      // value is current heading,
      // headingString is all text that goes under current heading
      // simpleText is text that doesn't have subheading and go under current heading but not its subheadings
      const newNode = new Node(line, headingString, simpleText);
      parentNode.addChild(newNode); // Connecting newly created node to its parent
      // Calling same method (recursion) with different params:
      // headingString is text that goes under current heading and we will look for subheadings in it
      // lines splitter
      // newNode - our newly created node will be parent node for its subheadings
      // depthNumber - increasing it to look for one heading separator more (## instead of # and so on)
      setNodes(headingString, /(\n)/, newNode, depthNumber + 1);
    }
  }
};

/**
 * @param root - current node
 */
// Going throughout all nodes and sorting them and
// setting lowest (the ones that don't have children (subheadings)) children simpleText values
const setLowestChildrenSimpleTextAndSort = (root) => {
  if (!root.getChildren().length) return; // If current node doesn't have children we break iteration
  sortNodeChildren(root); // Calling sorting method
  for (let i = 0; i < root.getChildren().length; i += 1) { // Going throughout all current node children
    const currentNode = root.getChildren()[i]; // Setting current child node

    // If current child has children of his own
    if (currentNode.getChildren().length) {
      // If current child has simpleText
      if (currentNode.getSimpleText()) {
        // We remove first character of it and add new line at the end (stupid but works)
        const text = `${currentNode.getSimpleText().substring(1)}\n`;
        // And setting updated simpleText to current node
        currentNode.setSimpleText(text);
      }
      setLowestChildrenSimpleTextAndSort(currentNode); // Calling same method but with currentNode as root
    } else {
      // If current node doesn't have children then setting its textValue as simpleText just without first character
      currentNode.setSimpleText(currentNode.getTextValue().substring(1));
    }
  }
};

/**
 * @param root - currentNode
 */
// Sorting current node children alphabetically
const sortNodeChildren = (root) => {
  if (!root.getChildren().length) return; // If current node doesn't have children we break iteration
  const updatedChildren = [...root.getChildren()]; // Creating new array with currentNode children
  updatedChildren.sort((a, b) => (a.value > b.value ? 1 : -1)); // Sorting new array headings alphabetically
  root.setChildren(updatedChildren); // Setting current node children as newly sorted array
};

// Global variable that contains sorted result
let result = '';

/**
 * @param children - current node children
 */
// Joining all nodes values (headings) and simpleTexts (text under headings)
const getTextFromNode = (children) => {
  for (let i = 0; i < children.length; i += 1) { // Going throughout all current node children
    result = result + children[i].getValue() + children[i].getSimpleText(); // Adding value and simpleText value to final result
    getTextFromNode(children[i].getChildren()); // Calling same method but with current node children as new current node children
  }
};

const rootNode = new Node('root'); // Creating root node which will contain main headings (#) as children
setNodes(inputStringValue, /(\n)/, rootNode, 1); // converting input text to nodes tree
setLowestChildrenSimpleTextAndSort(rootNode); // Sorting and setting simpleText as values
getTextFromNode(rootNode.getChildren()); // Joining tree to string which will be final result
console.log(rootNode);
console.log(inputStringValue);
console.log(result);