import {
    TFile,
} from "obsidian";

/**
 * getDailyNoteFilePath 関数
 * 
 * 指定された日付の日記ファイルのパスを生成します。
 * 
 * @param dailyNoteDir - 日記ファイルが保存されるディレクトリのパス
 * @param dateString - 日付文字列（オプション）。指定されない場合は現在の日付が使用されます。
 * @returns 生成された日記ファイルのパス
 */
export const getDailyNoteFilePath = (dailyNoteDir: string, dateString?: string | null) => {
	if (dateString == null) {
		dateString = moment().format("YYYY-MM-DD");
	}

	const d = moment(dateString);
	const year = d.format("YYYY");
	const month = d.format("MM");
	return `${dailyNoteDir}/${year}/${month}/${dateString}.md`;
};

/**
 * getDailyNoteFile 関数
 * 
 * 指定された日付の日記ファイルを取得します。
 * 
 * @param dailyNoteDir - 日記ファイルが保存されるディレクトリのパス
 * @param dateString - 日付文字列
 * @returns 指定された日付の日記ファイル、または undefined（ファイルが存在しない場合）
 */
export const getDailyNoteFile = (dailyNoteDir: string, dateString: string) => {
	const filePath = getDailyNoteFilePath(dailyNoteDir, dateString);
	return app.vault.getAbstractFileByPath(filePath);
};

/**
 * getOrCreateFile 関数
 * 
 * 指定されたパスのファイルを取得し、存在しない場合は新規作成します。
 * 
 * @param filePath - ファイルのパス
 * @returns Promise<TFile> - 取得または作成されたファイル
 */
export const getOrCreateFile = async (filePath: string): Promise<TFile> => {
	let abstractFile = app.vault.getAbstractFileByPath(filePath);
	if (abstractFile == null) {
		return await app.vault.create(filePath, "");
	} 
	return abstractFile as TFile;
};

/**
 * appendTextToFile 関数
 * 
 * 指定されたファイルにテキストを追加します。ファイルが存在しない場合は作成します。
 * 
 * @param filePath - ファイルのパス
 * @param text - 追加するテキスト
 * @returns Promise<TFile> - テキストが追加されたファイル
 */
export const appendTextToFile = async (filePath: string, text: string): Promise<TFile> => {
	const file: TFile = await getOrCreateFile(filePath);
	await app.vault.append(file, text);
	return file;
};

/**
 * openFileWithHoverEditor 関数
 * 
 * 指定されたファイルをホバーエディタで開きます。
 * 
 * @param filePath - 開くファイルのパス
 * @param unfocus - エディタにフォーカスを当てないかどうか（デフォルトはfalse）
 * @returns Promise<any> - 開かれたホバーエディタのリーフ
 */
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

/**
 * openFileWithHoverEditorAndSetCursorLastLine 関数
 * 
 * 指定されたファイルをホバーエディタで開き、カーソルを最後の行に設定します。
 * 
 * @param filePath - 開くファイルのパス
 * @returns Promise<any> - 開かれたホバーエディタのリーフ
 */
export const openFileWithHoverEditorAndSetCursorLastLine = async (filePath: string) => {
	const nl = await openFileWithHoverEditor(filePath);
	const e = nl.view.editor;
	e.setCursor(e.lastLine());
	return nl;
};

/**
 * insertProperties 関数
 * 
 * 指定されたファイルのフロントマターにプロパティを挿入します。
 * 
 * @param tfile - 対象のTFileオブジェクト
 * @param properties - 挿入するプロパティのオブジェクト
 */
export const insertProperties = (tfile: TFile, properties: {[key: string]: string | string[]}) => {
	app.fileManager.processFrontMatter(tfile, (fm) => {
		Object.keys(properties).forEach((key) => {
			fm[key] = properties[key];
		});
	});
};

/**
 * addTag 関数
 * 
 * 指定されたファイルのフロントマターにタグを追加します。
 * 
 * @param tfile - 対象のTFileオブジェクト
 * @param tag - 追加するタグ
 */
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

/**
 * removeTag 関数
 * 
 * 指定されたファイルのフロントマターからタグを削除します。
 * 
 * @param tfile - 対象のTFileオブジェクト
 * @param tag - 削除するタグ
 */
export const removeTag = (tfile: TFile, tag: string) => {
	app.fileManager.processFrontMatter(tfile, (fm) => {
		if (fm["tags"] == null) {
			fm["tags"] = [];
		}
		fm["tags"] = fm["tags"].filter((t: string) => t !== tag);
	});
};

/**
 * removeFrontmatterWithContentArray 関数
 * 
 * 文字列配列からフロントマターを削除します。
 * 
 * @param contentArray - フロントマターを含む可能性のある文字列配列
 * @returns フロントマターが削除された文字列配列
 */
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

/**
 * removeFrontmatter 関数
 * 
 * 文字列からフロントマターを削除します。
 * 
 * @param content - フロントマターを含む可能性のある文字列
 * @returns フロントマターが削除された文字列
 */
export const removeFrontmatter = (content: string): string => {
	const contentArray = content.split("\n");

	return removeFrontmatterWithContentArray(contentArray).join("\n");
}


