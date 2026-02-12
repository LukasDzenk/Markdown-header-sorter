/**
 * Tests for sortMarkdownHeaders (recursive and single-level).
 * Run: node sortMarkdown.test.js
 */

const { sortMarkdownHeaders } = require('../js/recursiveSort.js');

function assertEqual(actual, expected, message) {
  const a = actual.replace(/\r/g, '');
  const e = expected.replace(/\r/g, '');
  if (a !== e) {
    console.error('FAIL:', message || '');
    console.error('Expected:\n', JSON.stringify(e));
    console.error('Actual:\n', JSON.stringify(a));
    process.exitCode = 1;
    return false;
  }
  return true;
}

function assertContains(actual, substring, message) {
  if (!actual.includes(substring)) {
    console.error('FAIL:', message || '');
    console.error('Expected to contain:', JSON.stringify(substring));
    console.error('Actual:', JSON.stringify(actual));
    process.exitCode = 1;
    return false;
  }
  return true;
}

// --- Recursive (all levels) ---

function testRecursiveBasic() {
  const input = `
# B

B text

# A

A text
`;
  const out = sortMarkdownHeaders(input, { level: 'all' });
  assertContains(out, '# A', 'recursive: # A should appear');
  assertContains(out, '# B', 'recursive: # B should appear');
  const posA = out.indexOf('# A');
  const posB = out.indexOf('# B');
  if (posA >= 0 && posB >= 0 && posA > posB) {
    console.error('FAIL: recursive basic order - # A should come before # B');
    process.exitCode = 1;
  }
  console.log('PASS: recursive basic');
}

function testRecursiveNested() {
  const input = `
# Z

Z text

## ZB

ZB text

## ZA

ZA text

# A

A text

## AB

AB text

## AA

AA text
`;
  const out = sortMarkdownHeaders(input, { level: 'all' });
  // Top level: A then Z
  const idxA = out.indexOf('# A\n');
  const idxZ = out.indexOf('# Z\n');
  if (idxA < 0 || idxZ < 0 || idxA >= idxZ) {
    console.error('FAIL: recursive nested - top level order');
    process.exitCode = 1;
  }
  // Under # A: AA then AB
  const aSection = out.slice(out.indexOf('# A'), out.indexOf('# Z'));
  const idxAA = aSection.indexOf('## AA');
  const idxAB = aSection.indexOf('## AB');
  if (idxAA < 0 || idxAB < 0 || idxAA >= idxAB) {
    console.error('FAIL: recursive nested - level 2 under A');
    process.exitCode = 1;
  }
  // Under # Z: ZA then ZB
  const zSection = out.slice(out.indexOf('# Z'));
  const idxZA = zSection.indexOf('## ZA');
  const idxZB = zSection.indexOf('## ZB');
  if (idxZA < 0 || idxZB < 0 || idxZA >= idxZB) {
    console.error('FAIL: recursive nested - level 2 under Z');
    process.exitCode = 1;
  }
  console.log('PASS: recursive nested');
}

function testRecursivePreservesContent() {
  const input = `
# B

Body B here

# A

Body A here
`;
  const out = sortMarkdownHeaders(input, { level: 'all' });
  assertContains(out, 'Body A here', 'content under A preserved');
  assertContains(out, 'Body B here', 'content under B preserved');
  console.log('PASS: recursive preserves content');
}

function testRecursiveNoExtraNewlineRequired() {
  // Requirement: newline above and below each header line
  const input = `

# C

C text

# A

A text

# B

B text
`;
  const out = sortMarkdownHeaders(input, { level: 'all' });
  const order = [];
  let i = 0;
  while (i < out.length) {
    const m = out.slice(i).match(/^# ([A-Z])\n/m);
    if (m) {
      order.push(m[1]);
      i += m.index + m[0].length;
    } else break;
  }
  if (order.join('') !== 'ABC') {
    console.error('FAIL: recursive order expected A,B,C got', order);
    process.exitCode = 1;
  }
  console.log('PASS: recursive order A,B,C');
}

function testRecursiveEmptyInput() {
  const out = sortMarkdownHeaders('', { level: 'all' });
  assertEqual(out, '', 'empty input -> empty output');
  console.log('PASS: recursive empty input');
}

function testRecursiveNoHeadings() {
  const input = 'Just some text\n\nNo headers here.';
  const out = sortMarkdownHeaders(input, { level: 'all' });
  assertEqual(out, '', 'no valid headings -> empty (only headings are output)');
  console.log('PASS: recursive no headings');
}

function testRecursiveDeepLevels() {
  const input = `
# 2

## 2B

### 2B2

2B2 text

### 2B1

2B1 text

## 2A

2A text

# 1

1 text
`;
  const out = sortMarkdownHeaders(input, { level: 'all' });
  assertContains(out, '# 1\n', 'level 1: 1 first');
  assertContains(out, '# 2\n', 'level 1: 2 second');
  assertContains(out, '### 2B1', '2B1 before 2B2');
  assertContains(out, '### 2B2', '2B2 after 2B1');
  assertContains(out, '2B1 text', 'deep content preserved');
  console.log('PASS: recursive deep levels');
}

// --- Single level ---

function testSingleLevel() {
  const input = `
# Doc

## Zebra

Z content

## Apple

A content

## Mango

M content
`;
  const out = sortMarkdownHeaders(input, { level: 2 });
  const idxApple = out.indexOf('## Apple');
  const idxMango = out.indexOf('## Mango');
  const idxZebra = out.indexOf('## Zebra');
  if (idxApple < 0 || idxMango < 0 || idxZebra < 0) {
    console.error('FAIL: single level - all sections present');
    process.exitCode = 1;
  }
  if (!(idxApple < idxMango && idxMango < idxZebra)) {
    console.error('FAIL: single level - order should be Apple, Mango, Zebra');
    process.exitCode = 1;
  }
  console.log('PASS: single level');
}

function testSingleLevelPreservesLevel1() {
  const input = `
# First

## B

B

## A

A
`;
  const out = sortMarkdownHeaders(input, { level: 2 });
  assertContains(out, '# First', 'level 1 preserved when sorting level 2');
  assertContains(out, '## A', 'level 2 A');
  assertContains(out, '## B', 'level 2 B');
  const posA = out.indexOf('## A');
  const posB = out.indexOf('## B');
  if (posA >= posB) {
    console.error('FAIL: level 2 order A then B');
    process.exitCode = 1;
  }
  console.log('PASS: single level preserves other levels');
}

function testDefaultOptions() {
  const input = `
# B

b

# A

a
`;
  const out = sortMarkdownHeaders(input);
  const idxA = out.indexOf('# A');
  const idxB = out.indexOf('# B');
  if (idxA < 0 || idxB < 0 || idxA >= idxB) {
    console.error('FAIL: default options (all)');
    process.exitCode = 1;
  }
  console.log('PASS: default options');
}

function testLocaleSort() {
  const input = `
# Ö

o text

# A

a text
`;
  const out = sortMarkdownHeaders(input, { level: 'all' });
  const idxA = out.indexOf('# A');
  const idxO = out.indexOf('# Ö');
  if (idxA < 0 || idxO < 0) {
    console.error('FAIL: locale sort - both headings present');
    process.exitCode = 1;
  }
  if (idxA >= idxO) {
    console.error('FAIL: locale sort - A before Ö');
    process.exitCode = 1;
  }
  console.log('PASS: locale sort');
}

// Run all
testRecursiveBasic();
testRecursiveNested();
testRecursivePreservesContent();
testRecursiveNoExtraNewlineRequired();
testRecursiveEmptyInput();
testRecursiveNoHeadings();
testRecursiveDeepLevels();
testSingleLevel();
testSingleLevelPreservesLevel1();
testDefaultOptions();
testLocaleSort();

if (process.exitCode === 1) process.exit(1);
console.log('\nAll tests passed.');
