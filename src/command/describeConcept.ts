import { TFile } from "obsidian";

import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { chatAI } from "chatAI";

import * as myutil from "myutil";

export class DescribeConceptCommand implements CommandWithContext {
	id = "describe-concept";
	name = "Describe a concept";

	enableSetting: CommandSettingItem = {
		commandId: this.id,
		id: "enable",
		name: "Enable",
		type: "toggle",
	};

	describingConceptPromptTemplateFilePathSetting: CommandSettingItem = {
		commandId: this.id,
		id: "describingConceptPromptTemplateFilePath",
		name: "Describing concept *PROMPT* template file path",
		description: "Template for describing concept prompt",
		type: "text",
	};

	describingConceptFilePathTemplateSetting: CommandSettingItem = {
		commandId: this.id,
		id: "describingConceptFilePathTemplate",
		name: "Describing concept file path template", 
		description: "Template for describing concept file path (e.g. DescribeConcept__{{title}}.md => DescribeConcept__xxxxx__2024-01-12_000112.md)",
		type: "text",
	};

	settings = [
		this.enableSetting,
		this.describingConceptPromptTemplateFilePathSetting,
		this.describingConceptFilePathTemplateSetting,
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

		const templateFile = await app.vault.getAbstractFileByPath(
			cmctx.plugin.getCommandSetting(
				this.describingConceptPromptTemplateFilePathSetting
			)
		);
		if (templateFile == null) {
			throw new Error("templateFile is null");
		}
		const templateContent = await app.vault.cachedRead(
			templateFile as TFile
		);
		const prompt = templateContent.replace(/{{selected}}/g, selected);

		const prompts = [
			{
				role: "user",
				content: prompt,
			},
		];

		let result = await chatAI({ messages: prompts });

		const nowFileSuffix = moment().format("YYYY-MM-DD_HHmmss");
		const title = `${selected}__${nowFileSuffix}`;
		const describingConceptFilePathTemplate = cmctx.plugin.getCommandSetting(this.describingConceptFilePathTemplateSetting);
		const chatAISessionFilePath = describingConceptFilePathTemplate.replace(
				"{{title}}",
				title
			);
		await app.vault.create(chatAISessionFilePath, result);

		editor.replaceSelection(`${selected} [[${chatAISessionFilePath}]]`);

		app.workspace.openLinkText("", chatAISessionFilePath, true);

		const dailyNotePath = myutil.getDailyNoteFilePath(
			cmctx.plugin.getDailyNoteDirSetting()
		);
		myutil.appendTextToFile(
			dailyNotePath,
			`\n- [[${chatAISessionFilePath}]]\n`
		);

		cmctx.notice.setMessage("Finished !!");
	}
}
