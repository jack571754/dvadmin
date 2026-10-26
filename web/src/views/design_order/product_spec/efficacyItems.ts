export interface EfficacyItem {
	id: string;
	name: string;
	definition: string;
}

const stripEfficacyNumber = (value: string): string =>
	String(value || '').replace(/\s*\[\d+\]\s*$/, '').trim();

const createEfficacyId = (): string =>
	`efficacy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const createEmptyEfficacyItem = (): EfficacyItem => ({
	id: createEfficacyId(),
	name: '',
	definition: '',
});

export const cloneEfficacyItems = (items: readonly EfficacyItem[]): EfficacyItem[] =>
	items.map((item) => ({ ...item, id: item.id || createEfficacyId() }));

export const normalizeEfficacyItems = (value: unknown): EfficacyItem[] => {
	if (!Array.isArray(value)) return [];
	return value
		.map((item: any) => ({
			id: String(item?.id || createEfficacyId()),
			name: stripEfficacyNumber(String(item?.name || '')),
			definition: String(item?.definition || '').trim(),
		}))
		.filter((item) => item.name);
};

export const parseEfficacyText = (
	text: string,
	existingItems: readonly EfficacyItem[] = [],
): EfficacyItem[] => {
	const names = String(text || '')
		.split(/\r?\n/)
		.map(stripEfficacyNumber)
		.filter(Boolean);
	return names.map((name) => {
		const existing = existingItems.find((item) => stripEfficacyNumber(item.name) === name);
		return existing
			? { ...existing, name }
			: { ...createEmptyEfficacyItem(), name };
	});
};

export const hasEfficacyFootnote = (item: EfficacyItem): boolean =>
	Boolean(String(item.definition || '').trim());

export const countEfficacyFootnotes = (items: readonly EfficacyItem[]): number =>
	items.filter(hasEfficacyFootnote).length;

export const formatEfficacyText = (
	items: readonly EfficacyItem[],
	startNumber: number,
): string => {
	let nextNumber = startNumber;
	return items.map((item) => {
		const name = stripEfficacyNumber(item.name);
		if (!name || !hasEfficacyFootnote(item)) return name;
		return `${name}[${nextNumber++}]`;
	})
	.filter((name): name is string => Boolean(name))
	.join('\n');
};

export const formatEfficacyFootnote = (
	item: EfficacyItem,
	number: number,
): string | undefined => {
	const definition = String(item.definition || '').trim();
	// 没有释义的功效不分配角标，也不写入运营备注。
	return definition ? `[${number}]${definition}` : undefined;
};

export const sameEfficacyNames = (
	items: readonly EfficacyItem[],
	text: string,
): boolean => {
	const parsedNames = parseEfficacyText(text).map((item) => item.name);
	const itemNames = items.map((item) => stripEfficacyNumber(item.name)).filter(Boolean);
	return parsedNames.length === itemNames.length
		&& parsedNames.every((name, index) => name === itemNames[index]);
};

export const cleanEfficacyFootnotes = (
	text: string,
	items: readonly EfficacyItem[],
	previousItems: readonly EfficacyItem[] = [],
): string => {
	const names = new Set([
		...items.map((item) => stripEfficacyNumber(item.name)),
		...previousItems.map((item) => stripEfficacyNumber(item.name)),
	].filter(Boolean));
	const definitions = new Set([
		...items.map((item) => String(item.definition || '').trim()),
		...previousItems.map((item) => String(item.definition || '').trim()),
	].filter(Boolean));
	if (!names.size && !definitions.size) return String(text || '').trim();
	return String(text || '')
		.split('\n')
		.filter((line) => {
			const trimmed = line.trim();
			const match = trimmed.match(/^\[\d+\]\s*([^：:]+)(?:[：:].*)?$/);
			if (match && names.has(match[1].trim())) return false;
			const definitionMatch = trimmed.match(/^\[\d+\]\s*(.+)$/);
			return !definitionMatch || !definitions.has(definitionMatch[1].trim());
		})
		.join('\n')
		.trim();
};
