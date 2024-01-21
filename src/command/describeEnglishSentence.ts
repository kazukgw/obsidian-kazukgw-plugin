import { TFile } from "obsidian";

import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { chatAI } from "chatAI";

import * as myutil from "myutil";

export class DescribeEnglishSentenceCommand implements CommandWithContext {
	id = "describe-english-sentence";
	name = "Describe a English sentence";

	enableSetting: CommandSettingItem = {
		commandId: this.id,
		id: "enable",
		name: "Enable",
		type: "toggle",
	};

	englishSentenceFilePathTemplateSetting: CommandSettingItem = {
		commandId: this.id,
		id: "englishSentenceFilePathTemplate",
		name: "English sentence file path template",
		description: "Template for English sentence file path (e.g. EnglishSentence__{{title}}.md)",
		type: "text",
	};

	settings = [
		this.enableSetting,
		this.englishSentenceFilePathTemplateSetting,
	];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
		const editor = cmctx.mustGetEditor();
		const selected = editor.getSelection().trim();
		if (selected.length === 0) {
			throw new Error("selection string length is 0 !!");
		}

		const titleSentence =
			selected.length > 50 ? selected.slice(0, 50) + "..." : selected;

		const englishSentenceFilePathTemplate = cmctx.plugin.getCommandSetting(
			this.englishSentenceFilePathTemplateSetting
		);
		const targetFilePath = englishSentenceFilePathTemplate.replace(
			"{{title}}",
			titleSentence
		);
		const replaced = `${selected} [[${targetFilePath}]]`;

		editor.replaceSelection(replaced);

		const prompts = [
			{
				role: "user",
				content: `命令:
- あなたは英語ネイティブな英語教師です。
- 私は英語初心者です。
- 次の英文について日本語で詳しく解説してください。

制約:
- まず元の英文とその日本語訳を出力してください。
- 英文にでてくる単語について基本的なもの以外について説明してください。
- 品詞を分解して、特に複雑なところはや英語初心者が間違いやすいところはより詳しく解説してください。
- 口語的な表現かどうかについても説明してくだい。
- 同様の内容をより口語的な表現が可能な場合は、2人で行われるダイアログとして出力してください。
- できるだけ構造化してマークダウンで簡潔に出力してください。

英文:
${selected}
`,
			},
		];

		const dailyNotePath = myutil.getDailyNoteFilePath(
			cmctx.plugin.getDailyNoteDirSetting()
		);
		let result = await chatAI({ messages: prompts });
		result += `\n\n- [[${dailyNotePath}]]`;

		let targetFile = app.vault.getAbstractFileByPath(targetFilePath);
		if (targetFile != null) {
			cmctx.notice.setMessage("すでに ${replaced} は存在します");
			app.vault.append(
				targetFile as TFile,
				"\n- [[" + moment().format("YYYY-MM-DD") + "]]"
			);
		} else {
			const file = await myutil.appendTextToFile(targetFilePath, result);
			myutil.addTag(file, "english");
		}

		myutil.appendTextToFile(dailyNotePath, `\n- [[${targetFilePath}]]\n`);

		cmctx.notice.setMessage("Finished !!");
	}
}
