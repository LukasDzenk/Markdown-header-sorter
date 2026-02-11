# Markdown header sorter

Sort markdown sections alphabetically by heading text. Use it [online](https://lukasdzn.github.io/Markdown-header-sorter/) or run the script in Node. No build step, no dependencies.

## Try it

**[Open the app →](https://lukasdzn.github.io/Markdown-header-sorter/)**

Paste markdown, choose a header level (# to ######) or “All headers,” and get sections sorted A–Z. Copy the result with one click.

## Features

- **Recursive sort** — Sort all header levels at once; nested structure is preserved and sorted at each level.
- **Single-level sort** — Sort only `#`, `##`, `###`, etc., leaving other levels unchanged.
- **Live output** — Result updates as you type.
- **No backend** — Runs entirely in the browser (or in Node for the core logic).
- **Free and open source** — No account, no install for the web app.

## Format requirements

Headers are only detected when they have a **blank line above and below**:

```markdown
# Topic

## My topic

## My other topic
```

Without blank lines around headers, the sorter won’t see them.

## Run locally

### Web app

From the project root, start the included Node server (no extra packages):

```bash
node server.js
```

Then open **http://localhost:3000** in your browser.

### Core logic (Node)

The sorting logic is in `recursiveSort.js` and can be used in Node:

```javascript
const { sortMarkdownHeaders } = require('./recursiveSort.js');

const markdown = `
# B
B content

# A
A content
`;

console.log(sortMarkdownHeaders(markdown, { level: 'all' }));
// Output: # A ... # B ...
```

**API:** `sortMarkdownHeaders(input, options)`

- `input` — Raw markdown string.
- `options.level` — `'all'` (recursive) or `1`–`6` (sort only that header level).
- Returns the sorted markdown string.

### Tests

Run the test suite (Node):

```bash
node sortMarkdown.test.js
```

## Project structure

```
├── index.html          # Single-page app (UI + script load)
├── server.js           # Local static server (node server.js)
├── recursiveSort.js    # Core: parse, sort, serialize (browser + Node)
├── sortMarkdown.test.js
├── css/
│   ├── normalize.css
│   └── style.css
├── images/             # Favicons, PWA icons, web manifest
├── sitemap.xml
└── robots.txt
```

No build step; plain HTML and CSS.

## Author

**Lukas Dzenkauskas**  
[GitHub](https://github.com/LukasDZN) · [Buy me a coffee](https://www.buymeacoffee.com/lukasdzn)

## License

MIT (see repository for details).
