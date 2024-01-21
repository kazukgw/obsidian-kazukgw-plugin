import {
    TFile,
} from "obsidian";

export const getDailyNoteFilePath = (dailyNoteDir: string, dateString?: string | null) => {
	if (dateString == null) {
		dateString = moment().format("YYYY-MM-DD");
	}

	const d = moment(dateString);
	const year = d.format("YYYY");
	const month = d.format("MM");
	return `${dailyNoteDir}/${year}/${month}/${dateString}.md`;
};

export const getDailyNoteFile = (dailyNoteDir: string, dateString: string) => {
	const filePath = getDailyNoteFilePath(dailyNoteDir, dateString);
	return app.vault.getAbstractFileByPath(filePath);
};

export const getOrCreateFile = async (filePath: string): Promise<TFile> => {
	let abstractFile = app.vault.getAbstractFileByPath(filePath);
	if (abstractFile == null) {
		return await app.vault.create(filePath, "");
	} 
	return abstractFile as TFile;
};

export const appendTextToFile = async (filePath: string, text: string): Promise<TFile> => {
	const file: TFile = await getOrCreateFile(filePath);
	await app.vault.append(file, text);
	return file;
};

export const openFileWithHoverEditor = async (filePath: string, unfocus: boolean = false) => {
	const file = await getOrCreateFile(filePath);
	const newLeaf = app.plugins.plugins["obsidian-hover-editor"].spawnPopover();
	newLeaf.openFile(file);
	let elapsed = 0;
	if (unfocus) {
		return newLeaf;
	}

	while (true) {
		let vs = newLeaf.getViewState();
		if (vs["type"] != null && vs["type"] !== "empty") {
			break;
		} else if (elapsed > 3000) {
			break;
		}
		await sleep(100);
		elapsed += 100;
	}
	await sleep(500);
	const e = newLeaf.view.editor;
	e.focus();
	return newLeaf;
};

export const openFileWithHoverEditorAndSetCursorLastLine = async (filePath: string) => {
	const nl = await openFileWithHoverEditor(filePath);
	const e = nl.view.editor;
	e.setCursor(e.lastLine());
	return nl;
};

export const insertProperties = (tfile: TFile, properties: {[key: string]: string | string[]}) => {
	app.fileManager.processFrontMatter(tfile, (fm) => {
		Object.keys(properties).forEach((key) => {
			fm[key] = properties[key];
		});
	});
};

export const addTag = (tfile: TFile, tag: string) => {
	app.fileManager.processFrontMatter(tfile, (fm) => {
		if (fm["tags"] == null) {
			fm["tags"] = [];
		}
		fm["tags"].push(tag);
		const uniqueTags = [...new Set(fm["tags"])];
		fm["tags"] = uniqueTags;
	});
};

export const removeTag = (tfile: TFile, tag: string) => {
	app.fileManager.processFrontMatter(tfile, (fm) => {
		if (fm["tags"] == null) {
			fm["tags"] = [];
		}
		fm["tags"] = fm["tags"].filter((t: string) => t !== tag);
	});
};

export const removeFrontmatterWithContentArray = (contentArray: string[]): string[] => {
	let startIndex = 0;
	let endIndex = 0; // contentArray.length;

	for (let i = 0; i < contentArray.length; i++) {
		if (!contentArray[i].trim()) {
			startIndex = i + 1;
		} else {
			break;
		}
	}

	if (contentArray[startIndex]?.startsWith("---")) {
		for (let i = startIndex + 1; i < contentArray.length; i++) {
			if (contentArray[i].startsWith("---")) {
				endIndex = i;
				break;
			}
		}
	}

	return contentArray.slice(endIndex);
}

export const removeFrontmatter = (content: string): string => {
	const contentArray = content.split("\n");

	return removeFrontmatterWithContentArray(contentArray).join("\n");
}

