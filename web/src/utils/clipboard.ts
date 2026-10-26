export interface ClipboardEnvironment {
	clipboard?: Pick<Clipboard, 'writeText'>;
	document: Document;
}

const getDefaultEnvironment = (): ClipboardEnvironment => ({
	clipboard: navigator.clipboard,
	document,
});

const copyWithLegacyCommand = (text: string, targetDocument: Document) => {
	const textarea = targetDocument.createElement('textarea');
	textarea.value = text;
	textarea.readOnly = true;
	textarea.style.position = 'fixed';
	textarea.style.opacity = '0';
	textarea.style.pointerEvents = 'none';
	targetDocument.body.appendChild(textarea);

	try {
		textarea.focus();
		textarea.select();
		textarea.setSelectionRange(0, text.length);
		if (!targetDocument.execCommand('copy')) {
			throw new Error('document.execCommand("copy") returned false');
		}
	} finally {
		textarea.remove();
	}
};

export const copyTextToClipboard = async (
	text: string,
	environment: ClipboardEnvironment = getDefaultEnvironment(),
) => {
	const errors: unknown[] = [];

	if (environment.clipboard) {
		try {
			await environment.clipboard.writeText(text);
			return;
		} catch (error) {
			errors.push(error);
		}
	}

	try {
		copyWithLegacyCommand(text, environment.document);
	} catch (error) {
		errors.push(error);
		throw new AggregateError(errors, '浏览器无法自动复制文本');
	}
};
