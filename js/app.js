/**
 * Page logic for Markdown header sorter: examples, toolbar, persistence, easter egg.
 */

(function () {
	const textAreaInput = document.getElementById('textAreaInput');
	const textAreaOutput = document.getElementById('textAreaOutput');

	const examples = {
		simple: `# Zebra

Content for Zebra.

# Apple

Content for Apple.

# Mango

Content for Mango.`,

		'two-levels': `# Docs

## Zebra

Zebra section text.

## Apple

Apple section text.

## Mango

Mango section text.`,

		recursive: `# Zulu

Intro for Zulu.

## Zulu Bravo

Bravo content.

## Zulu Alpha

Alpha content.

### Zulu Alpha Two

Nested two.

### Zulu Alpha One

Nested one.

# Alpha

Intro for Alpha.

## Alpha Zebra

Content.

## Alpha Mike

Content.

### Alpha Mike Second

Deep.

### Alpha Mike First

Deep.

## Alpha Apple

Content.`
	};

	document.querySelectorAll('.btn--example').forEach(function (btn) {
		btn.addEventListener('click', function () {
			const key = this.getAttribute('data-example');
			if (!key || !examples[key]) return;
			textAreaInput.value = examples[key];
			inputTextProcessing();
		});
	});

	document.getElementById('toggleWrapButtonId').addEventListener('click', function () {
		if (textAreaInput.style.whiteSpace === 'normal') {
			textAreaInput.style.whiteSpace = 'nowrap';
			textAreaOutput.style.whiteSpace = 'nowrap';
			localStorage.setItem('wrap', 'nowrap');
		} else {
			textAreaInput.style.whiteSpace = 'normal';
			textAreaOutput.style.whiteSpace = 'normal';
			localStorage.setItem('wrap', 'normal');
		}
	});
	if (localStorage.getItem('wrap') === 'nowrap') {
		textAreaInput.style.whiteSpace = 'nowrap';
		textAreaOutput.style.whiteSpace = 'nowrap';
	}

	document.getElementById('clearButtonId').addEventListener('click', function () {
		textAreaInput.value = '';
		textAreaOutput.value = '';
		inputTextProcessing();
	});

	document.getElementById('copyResultButtonId').addEventListener('click', function () {
		textAreaOutput.select();
		document.execCommand('copy');
	});

	const wordCounter = document.getElementById('wordCountId');
	function countWords(str) {
		var matches = str.match(/[\w\d\'\'-]+/gi);
		return matches ? matches.length : 0;
	}
	function pad(str, len) {
		return ('' + str).padEnd(len, '\u00A0');
	}
	function syncOutput() {
		wordCounter.textContent = 'Characters: ' + pad(textAreaInput.value.length, 6) + '  |  Words: ' + pad(countWords(textAreaInput.value), 4);
		inputTextProcessing();
	}
	textAreaInput.addEventListener('input', syncOutput);
	textAreaInput.addEventListener('change', syncOutput);
	textAreaInput.addEventListener('keyup', syncOutput);
	textAreaInput.addEventListener('keydown', function () {
		setTimeout(syncOutput, 0);
	});

	const radioButtons = document.querySelectorAll('.radioButton');
	const savedLevel = localStorage.getItem('headerLevel');
	radioButtons.forEach(function (btn) {
		if (btn.value === savedLevel) {
			radioButtons.forEach(function (b) { b.classList.remove('activeRadioButton'); });
			btn.classList.add('activeRadioButton');
		}
		btn.addEventListener('click', function () {
			radioButtons.forEach(function (b) { b.classList.remove('activeRadioButton'); });
			this.classList.add('activeRadioButton');
			localStorage.setItem('headerLevel', this.value);
			inputTextProcessing();
		});
	});

	function inputTextProcessing() {
		const input = textAreaInput.value;
		localStorage.setItem('input', input);
		const activeBtn = document.querySelector('.activeRadioButton');
		const raw = activeBtn ? activeBtn.value : 'all';
		const level = raw === 'all' ? 'all' : { '#': 1, '##': 2, '###': 3, '####': 4, '#####': 5, '######': 6 }[raw];
		let result = '';
		try {
			result = typeof window.sortMarkdownHeaders === 'function'
				? window.sortMarkdownHeaders(input, { level: level })
				: '';
		} catch (e) {
			result = '';
		}
		textAreaOutput.value = result === '' && level !== 'all' ? 'Selected header level was not found' : result;
		localStorage.setItem('output', textAreaOutput.value);
	}

	(function () {
		const savedInput = localStorage.getItem('input');
		if (savedInput != null && savedInput !== '') textAreaInput.value = savedInput;
		syncOutput();
	})();

	function playEasterEgg() {
		new Audio('assets/audio/MJ.mp3').play();
	}
	document.getElementById('s').addEventListener('click', playEasterEgg);
	document.getElementById('easter-egg-play').addEventListener('click', playEasterEgg);
})();
