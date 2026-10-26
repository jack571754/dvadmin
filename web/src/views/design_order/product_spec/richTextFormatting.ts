export interface RichTextColor {
	rgb?: string | null;
}

export interface RichTextStyle {
	bg?: RichTextColor | null;
	cl?: RichTextColor | null;
	[key: string]: unknown;
}

export interface RichTextRun {
	st: number;
	ed: number;
	ts?: RichTextStyle;
}

export interface RichTextSegment {
	start: number;
	end: number;
	text: string;
	style: RichTextStyle;
}

export interface RichTextFormatChange {
	start: number;
	end: number;
	style: RichTextStyle;
}

const buildCharacterMap = (oldText: string, newText: string): number[] => {
	const table = Array.from({ length: oldText.length + 1 }, () =>
		Array<number>(newText.length + 1).fill(0),
	);
	for (let oldIndex = oldText.length - 1; oldIndex >= 0; oldIndex -= 1) {
		for (let newIndex = newText.length - 1; newIndex >= 0; newIndex -= 1) {
			table[oldIndex][newIndex] = oldText[oldIndex] === newText[newIndex]
				? table[oldIndex + 1][newIndex + 1] + 1
				: Math.max(table[oldIndex + 1][newIndex], table[oldIndex][newIndex + 1]);
		}
	}

	const mapped = Array<number>(oldText.length).fill(-1);
	let oldIndex = 0;
	let newIndex = 0;
	while (oldIndex < oldText.length && newIndex < newText.length) {
		if (oldText[oldIndex] === newText[newIndex]) {
			mapped[oldIndex] = newIndex;
			oldIndex += 1;
			newIndex += 1;
			continue;
		}
		if (table[oldIndex + 1][newIndex] >= table[oldIndex][newIndex + 1]) oldIndex += 1;
		else newIndex += 1;
	}
	return mapped;
};

export const remapRichTextRuns = (
	oldText: string,
	newText: string,
	runs: ReadonlyArray<RichTextRun>,
): RichTextRun[] => {
	if (!runs.length || !oldText || !newText) return [];
	if (oldText === newText) return runs.map((run) => ({ ...run, ts: run.ts ? { ...run.ts } : undefined }));
	const characterMap = buildCharacterMap(oldText, newText);
	const remapped: RichTextRun[] = [];
	for (const run of runs) {
		let start = -1;
		let previous = -1;
		const end = Math.min(run.ed, oldText.length);
		for (let oldIndex = Math.max(run.st, 0); oldIndex < end; oldIndex += 1) {
			const mappedIndex = characterMap[oldIndex];
			if (mappedIndex < 0) continue;
			if (start < 0) start = mappedIndex;
			if (previous >= 0 && mappedIndex !== previous + 1) {
				remapped.push({ st: start, ed: previous + 1, ts: run.ts ? { ...run.ts } : undefined });
				start = mappedIndex;
			}
			previous = mappedIndex;
		}
		if (start >= 0 && previous >= start) {
			remapped.push({ st: start, ed: previous + 1, ts: run.ts ? { ...run.ts } : undefined });
		}
	}
	return remapped;
};

const clampOffset = (offset: number, textLength: number): number =>
	Math.min(Math.max(offset, 0), textLength);

const collectBoundaries = (
	textLength: number,
	runs: ReadonlyArray<RichTextRun>,
): number[] => {
	const boundaries = new Set<number>([0, textLength]);
	for (const run of runs) {
		boundaries.add(clampOffset(run.st, textLength));
		boundaries.add(clampOffset(run.ed, textLength));
	}
	return Array.from(boundaries).sort((left, right) => left - right);
};

const findStyleAt = (
	offset: number,
	runs: ReadonlyArray<RichTextRun>,
): RichTextStyle => {
	const run = runs.find((item) => item.st <= offset && item.ed > offset);
	return run?.ts ? { ...run.ts } : {};
};

export const buildRichTextSegments = (
	text: string,
	runs: ReadonlyArray<RichTextRun>,
): RichTextSegment[] => {
	if (!text) return [];
	const boundaries = collectBoundaries(text.length, runs);
	return boundaries.slice(0, -1).map((start, index) => {
		const end = boundaries[index + 1];
		return {
			start,
			end,
			text: text.slice(start, end),
			style: findStyleAt(start, runs),
		};
	}).filter((segment) => segment.start < segment.end);
};
