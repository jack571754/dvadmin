export const escapeRegExp = (string: string): string => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const getCleanNickname = (nicknameVal: any, uniqueNicknames: string[]): string => {
	if (!nicknameVal) return '';
	const str = String(nicknameVal).trim();
	for (const nickname of uniqueNicknames) {
		if (str === nickname || str.startsWith(nickname)) {
			return nickname;
		}
	}
	const bracketIndex = str.search(/\[\d+\]/);
	if (bracketIndex !== -1) {
		return str.substring(0, bracketIndex).trim();
	}
	return str;
};

export const getProductCoords = (idx: number, rowsPerBlock = 15, columnsPerBlock = 6) => {
	const blockIndex = Math.floor(idx / columnsPerBlock);
	const blockCol = (idx % columnsPerBlock) + 1;
	const blockStartRow = blockIndex * rowsPerBlock;
	return { blockIndex, blockCol, blockStartRow };
};

export const highlightText = (text: string, query: string): string => {
	if (!query) return text;
	const escaped = escapeRegExp(query);
	const regex = new RegExp(`(${escaped})`, 'gi');
	return text.replace(regex, '<span class="highlight-match">$1</span>');
};

export const getCursorOffsetInContainer = (container: HTMLElement): number => {
	try {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0) return 0;
		const range = selection.getRangeAt(0);
		if (!container.contains(range.startContainer)) return 0;
		
		const preCaretRange = range.cloneRange();
		preCaretRange.selectNodeContents(container);
		preCaretRange.setEnd(range.startContainer, range.startOffset);
		return preCaretRange.toString().length;
	} catch (e) {
		console.warn('Error calculating caret offset:', e);
		return 0;
	}
};

export const setCaretPosition = (el: HTMLElement, start: number, end: number): Range | null => {
	const range = document.createRange();
	const sel = window.getSelection();
	if (!sel) return null;
	
	let charIndex = 0;
	let startNode: Node | null = null;
	let startOffset = 0;
	let endNode: Node | null = null;
	let endOffset = 0;
	
	const traverseNodes = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			const nextCharIndex = charIndex + (node.textContent || '').length;
			if (!startNode && start >= charIndex && start <= nextCharIndex) {
				startNode = node;
				startOffset = start - charIndex;
			}
			if (!endNode && end >= charIndex && end <= nextCharIndex) {
				endNode = node;
				endOffset = end - charIndex;
			}
			charIndex = nextCharIndex;
		} else {
			for (let i = 0; i < node.childNodes.length; i++) {
				traverseNodes(node.childNodes[i]);
			}
		}
	};
	
	traverseNodes(el);
	
	if (startNode && endNode) {
		range.setStart(startNode, startOffset);
		range.setEnd(endNode, endOffset);
		sel.removeAllRanges();
		sel.addRange(range);
		return range;
	}
	return null;
};
