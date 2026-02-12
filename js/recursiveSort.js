/**
 * Markdown header sorter: sorts markdown sections alphabetically by heading text.
 * Supports recursive sort (all levels) or sort at a single header level (#, ##, ...).
 *
 * Requirement: each header must have a newline above and below it to be recognized.
 */

/**
 * @param {string} value - Heading line, e.g. "# Main" or "### Sub"
 * @param {string} textValue - All content under this heading (including subheadings)
 * @param {string} simpleText - Content under this heading that is not under a subheading
 */
function Node(value, textValue = '', simpleText = '') {
  this.value = value;
  this.simpleText = simpleText;
  this.textValue = textValue;
  this.children = [];
  this.parent = null;

  this.setParentNode = function (node) {
    this.parent = node;
  };

  this.addChild = function (node) {
    node.setParentNode(this);
    this.children.push(node);
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

const SEPARATOR = '#';
const SPLITTER = /(\n)/;

/**
 * Returns true if the line is a heading at the given depth.
 * Requirement: newline immediately before and after the heading line in the split array.
 * Start of document (index === 0) is treated as having a newline before so the first line can be a heading.
 */
function isHeadingLine(line, depthNumber, splitString, index) {
  if (!line || line.length <= depthNumber) return false;
  const prefix = SEPARATOR.repeat(depthNumber);
  const nextChar = line[depthNumber];
  const hasNewlineBefore = index === 0 || (index > 0 && splitString[index - 1] === '\n');
  const hasNewlineAfter = index < splitString.length - 1 && splitString[index + 1] === '\n';
  return (
    line.slice(0, depthNumber) === prefix &&
    nextChar !== SEPARATOR &&
    hasNewlineBefore &&
    hasNewlineAfter
  );
}

/**
 * Parse input into a tree of nodes. Each heading (with blank line before/after) becomes a node;
 * its content is everything until the next same-level heading.
 */
function setNodes(inputString, parentNode, depthNumber) {
  const splitString = inputString.split(SPLITTER);

  for (let i = 0; i < splitString.length; i += 1) {
    const line = splitString[i];

    if (!isHeadingLine(line, depthNumber, splitString, i)) continue;

    // Collect all content under this heading until the next same-level heading
    let headingString = splitString[i + 1];
    for (let j = i + 2; j < splitString.length; j += 1) {
      const line2 = splitString[j];
      if (isHeadingLine(line2, depthNumber, splitString, j)) {
        i = j - 1;
        break;
      }
      headingString += line2;
    }

    // simpleText = content before first subheading at depth+1
    const subHeadingPattern = `\n${SEPARATOR.repeat(depthNumber + 1)}`;
    const subIdx = headingString.indexOf(subHeadingPattern);
    const simpleText = subIdx >= 0 ? headingString.slice(0, subIdx) : '';

    const newNode = new Node(line, headingString, simpleText);
    parentNode.addChild(newNode);
    setNodes(headingString, newNode, depthNumber + 1);
  }
}

/**
 * Sort each node's children alphabetically by heading text (locale-aware).
 */
function sortNodeChildren(root) {
  if (!root.getChildren().length) return;
  const children = [...root.getChildren()];
  children.sort((a, b) => (a.value || '').localeCompare(b.value || '', undefined, { sensitivity: 'base' }));
  root.setChildren(children);
}

/**
 * Set simpleText on leaf nodes (content only) and sort the tree in-place.
 */
function setLowestChildrenSimpleTextAndSort(root) {
  if (!root.getChildren().length) return;
  sortNodeChildren(root);
  for (let i = 0; i < root.getChildren().length; i += 1) {
    const child = root.getChildren()[i];
    if (child.getChildren().length) {
      if (child.getSimpleText()) {
        const text = child.getSimpleText().replace(/^\n/, '') + '\n';
        child.setSimpleText(text);
      }
      setLowestChildrenSimpleTextAndSort(child);
    } else {
      const textValue = child.getTextValue();
      child.setSimpleText(textValue ? textValue.replace(/^\n/, '') : '');
    }
  }
}

/**
 * Serialize tree back to markdown string.
 * Ensures a newline between sibling sections when the previous section has no trailing newline.
 */
function getTextFromNode(children) {
  let out = '';
  for (let i = 0; i < children.length; i += 1) {
    if (i > 0 && !out.endsWith('\n')) out += '\n\n';
    out += children[i].getValue() + children[i].getSimpleText();
    out += getTextFromNode(children[i].getChildren());
  }
  return out;
}

/**
 * Recursive sort: build tree, sort at every level, serialize.
 */
function sortRecursive(inputString) {
  const root = new Node('root');
  setNodes(inputString, root, 1);
  setLowestChildrenSimpleTextAndSort(root);
  return getTextFromNode(root.getChildren());
}

/**
 * Single-level sort: split by the given header prefix, sort sections, rejoin.
 * If the document starts with a heading at this level, prepend newline so it is included in the sort.
 */
function sortSingleLevel(inputString, levelPrefix) {
  const needle = '\n' + levelPrefix + ' ';
  const prefixWithSpace = levelPrefix + ' ';
  const normalized = inputString.startsWith(prefixWithSpace) ? '\n' + inputString : inputString;
  const parts = normalized.split(needle);
  if (parts.length <= 1) return inputString;
  const first = parts[0];
  const rest = parts.slice(1);
  rest.sort((a, b) => (prefixWithSpace + a).localeCompare(prefixWithSpace + b, undefined, { sensitivity: 'base' }));
  const result = first + rest.map((p) => needle + p).join('');
  return normalized !== inputString ? result.replace(/^\n/, '') : result;
}

/**
 * Sort markdown headers in the input string.
 *
 * @param {string} input - Raw markdown text
 * @param {{ level?: number | 'all' }} options - level: 1..6 to sort only that header level, or 'all' for recursive sort
 * @returns {string} Sorted markdown
 */
function sortMarkdownHeaders(input, options = {}) {
  const level = options.level === undefined ? 'all' : options.level;

  if (level === 'all') {
    return sortRecursive(input || '');
  }

  const n = Number(level);
  if (!Number.isInteger(n) || n < 1 || n > 6) {
    return input || '';
  }
  const prefix = SEPARATOR.repeat(n);
  return sortSingleLevel(input || '', prefix);
}

// Export for Node/ESM and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sortMarkdownHeaders, Node, setNodes, sortNodeChildren, getTextFromNode, setLowestChildrenSimpleTextAndSort };
}
if (typeof window !== 'undefined') {
  window.sortMarkdownHeaders = sortMarkdownHeaders;
}
