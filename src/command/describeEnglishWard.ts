import { TFile } from "obsidian";

import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { chatAI } from "chatAI";

import * as myutil from "myutil";

export class DescribeEnglishWardCommand implements CommandWithContext {
	id = "describe-english-word";
	name = "Describe a English word";

	enableSetting: CommandSettingItem = {
		commandId: this.id,
		id: "enable",
		name: "Enable",
		type: "toggle",
	};

	englishWardFilePathTemplateSetting: CommandSettingItem = {
		commandId: this.id,
		id: "englishWardFilePathTemplate",
		name: "English ward file path template",
		description: "Template for English ward file path (e.g. EnglishWard__{{title}}.md => EnglishWard__xxxxx.md)",
		type: "text",
	};

	settings = [this.enableSetting, this.englishWardFilePathTemplateSetting];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
		const editor = cmctx.mustGetEditor();
		const selected = editor.getSelection().trim();
		if (selected.length === 0) {
			throw new Error("selection string length is 0 !!");
		}

		const englishWardFilePathTemplateSetting =
			cmctx.plugin.getCommandSetting(
				this.englishWardFilePathTemplateSetting
			);
		const targetFilePath = englishWardFilePathTemplateSetting.replace(
			"{{title}}",
			selected
		);
		const replaced = `[[${targetFilePath}]]`;

		editor.replaceSelection(replaced);

		const prompts = [
			{
				role: "user",
				content: `命令:
- あなたは英語ネイティブな英語教師です。
- 次の英単語や英熟語、イディオムについて日本語で詳しく解説してください。

制約:
- 例文をできるだけテクノロジーのトピックと関連付けて3つ作って日本語訳も添えてください。
- 英単語については発音についても説明してください。
- 口語的な表現かどうかについても説明してくだい。
- 同様の意味を持つ英単語や英熟語があれば挙げてください。
- 同義語のニュアンスや使い方の違いについても説明してください。
- 同様の内容がより口語的な表現が可能な場合は、2人で行われるダイアログとして出力してください。
- できるだけ構造化してマークダウンで簡潔に出力してください。

英単語/英熟語/イディオム:
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
