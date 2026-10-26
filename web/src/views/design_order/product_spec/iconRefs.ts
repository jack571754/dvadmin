/**
 * Icon 选择结果的纯函数层：角标文本、运营备注脚注、以及从单元格文本反查选择结果。
 *
 * 编号规则与主打功效同构——产品脚注占 1..K，功效占 K+1..K+M，Icon 紧接其后。
 */

export interface IconRef {
	id: number;
	shortName: string;
	interpretation: string;
	fileId: number | null;
}

export interface IconOption extends IconRef {
	/** 'all' = 品牌全部商品适用，'selected' = 指定商品适用 */
	scopeType: string;
	imageUrl: string;
}

const SUFFIX_PATTERN = /\s*\[\d+\]\s*$/;

const stripIconNumber = (value: string): string =>
	String(value || '').replace(SUFFIX_PATTERN, '').trim();

const normalizeFileId = (item: any): number | null => {
	const raw = item?.fileId
		?? item?.file_id
		?? item?.default_image?.file_id
		?? item?.defaultImage?.fileId;
	const fileId = Number(raw);
	return Number.isInteger(fileId) && fileId > 0 ? fileId : null;
};

const toIconRef = (item: any): IconRef | undefined => {
	const id = Number(item?.id);
	const shortName = stripIconNumber(String(item?.shortName ?? item?.short_name ?? ''));
	if (!Number.isFinite(id) || id <= 0 || !shortName) return undefined;
	return {
		id,
		shortName,
		interpretation: String(item?.interpretation ?? '').trim(),
		fileId: normalizeFileId(item),
	};
};

export const normalizeIconRefs = (value: unknown): IconRef[] => {
	if (!Array.isArray(value)) return [];
	const seen = new Set<number>();
	const result: IconRef[] = [];
	for (const item of value) {
		const ref = toIconRef(item);
		if (!ref || seen.has(ref.id)) continue;
		seen.add(ref.id);
		result.push(ref);
	}
	return result;
};

export const normalizeIconOptions = (value: unknown): IconOption[] => {
	if (!Array.isArray(value)) return [];
	const result: IconOption[] = [];
	for (const item of value as any[]) {
		const ref = toIconRef(item);
		if (!ref) continue;
		result.push({
			...ref,
			scopeType: String(item?.scopeType ?? item?.scope_type ?? ''),
			imageUrl: String(
				item?.imageUrl ?? item?.default_image?.url ?? item?.defaultImage?.url ?? '',
			),
		});
	}
	return result;
};

export const cloneIconRefs = (refs: readonly IconRef[]): IconRef[] =>
	refs.map((ref) => ({ ...ref }));

/** 合并多个主商品各自解析出的 Icon，按 id 去重并保持后端给出的稳定顺序。 */
export const mergeIconOptions = (lists: readonly IconOption[][]): IconOption[] => {
	const byId = new Map<number, IconOption>();
	for (const list of lists) {
		for (const option of list) {
			if (!byId.has(option.id)) byId.set(option.id, option);
		}
	}
	return [...byId.values()].sort((a, b) => a.id - b.id);
};

/** 按候选顺序排列已选 Icon，保证角标编号不随勾选顺序抖动。 */
export const orderIconRefs = (
	refs: readonly IconRef[],
	options: readonly IconOption[],
): IconRef[] => {
	const rank = new Map(options.map((option, index) => [option.id, index]));
	const fallback = options.length;
	return [...refs].sort(
		(a, b) => (rank.get(a.id) ?? fallback) - (rank.get(b.id) ?? fallback),
	);
};

export const hasIconFootnote = (ref: IconRef): boolean =>
	Boolean(String(ref.interpretation || '').trim());

/** icon 单元格内容：每行一个「简称[编号]」。 */
export const formatIconText = (
	refs: readonly IconRef[],
	startNumber: number,
): string => {
	let nextNumber = startNumber;
	return refs
		.map((ref) => {
			const shortName = stripIconNumber(ref.shortName);
			if (!shortName || !hasIconFootnote(ref)) return shortName;
			return `${shortName}[${nextNumber++}]`;
		})
		.filter(Boolean)
		.join('\n');
};

/** 运营备注脚注只展示释义，与功效脚注共用同一段编号空间。 */
export const formatIconFootnote = (
	ref: IconRef,
	number: number,
): string | undefined => {
	const interpretation = String(ref.interpretation || '').trim();
	return interpretation ? `[${number}]${interpretation}` : undefined;
};

export const parseIconNames = (text: string): string[] => String(text || '')
	.split(/\r?\n/)
	.map(stripIconNumber)
	.filter(Boolean);

export const sameIconNames = (
	refs: readonly IconRef[],
	text: string,
): boolean => {
	const names = parseIconNames(text);
	const refNames = refs.map((ref) => stripIconNumber(ref.shortName)).filter(Boolean);
	return names.length === refNames.length
		&& names.every((name, index) => name === refNames[index]);
};

/**
 * 从 icon 单元格文本还原选择结果。
 * 用于线上旧代码保存时丢掉 spec_data.iconRefs 的兜底，只认候选集中真实存在的简称。
 */
export const resolveIconRefsFromText = (
	text: string,
	options: readonly IconOption[],
): IconRef[] => {
	const byName = new Map(
		options.map((option) => [stripIconNumber(option.shortName).toLowerCase(), option]),
	);
	const result: IconRef[] = [];
	const seen = new Set<number>();
	for (const name of parseIconNames(text)) {
		const option = byName.get(name.toLowerCase());
		if (!option || seen.has(option.id)) continue;
		seen.add(option.id);
		result.push({
			id: option.id,
			shortName: option.shortName,
			interpretation: option.interpretation,
			fileId: option.fileId,
		});
	}
	return result;
};

/**
 * 清理运营备注里的 Icon 脚注行。
 *
 * 新格式按释义清理（`[数字]释义`），同时兼容旧格式（`[数字]简称：释义`）。
 * 当前与上一次的 Icon 引用都要传入，避免选择变化后残留旧脚注。
 */
export const cleanIconFootnotes = (
	text: string,
	refs: readonly IconRef[],
	previousRefs: readonly IconRef[] = [],
): string => {
	const allRefs = [...refs, ...previousRefs];
	const names = new Set(
		allRefs
			.map((ref) => stripIconNumber(ref.shortName).toLowerCase())
			.filter(Boolean),
	);
	const interpretations = new Set(
		allRefs
			.map((ref) => String(ref.interpretation || '').trim())
			.filter(Boolean),
	);
	const legacyFootnotes = new Set(
		allRefs
			.map((ref) => {
				const name = stripIconNumber(ref.shortName).toLowerCase();
				const interpretation = String(ref.interpretation || '').trim();
				return name && interpretation ? `${name}\0${interpretation}` : '';
			})
			.filter(Boolean),
	);
	if (!names.size && !interpretations.size) return String(text || '').trim();
	return String(text || '')
		.split('\n')
		.filter((line) => {
			const trimmed = line.trim();
			const legacyMatch = trimmed.match(/^\[\d+\]\s*([^：:]+?)\s*[：:]\s*(.*)$/);
			if (legacyMatch) {
				if (names.has(legacyMatch[1].trim().toLowerCase())) return false;
				const legacyKey = `${legacyMatch[1].trim().toLowerCase()}\0${legacyMatch[2].trim()}`;
				if (legacyFootnotes.has(legacyKey)) return false;
			}
			const currentMatch = trimmed.match(/^\[\d+\]\s*(.+)$/);
			if (!currentMatch) return true;
			const content = currentMatch[1].trim();
			return !names.has(content.toLowerCase()) && !interpretations.has(content);
		})
		.join('\n')
		.trim();
};
