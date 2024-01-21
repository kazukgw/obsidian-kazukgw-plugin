import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

import { openPrompt } from "promptModal";

import * as myutil from "myutil";

export class AddTagPropertyCommand implements CommandWithContext {
	id = "add-tag-property";
	name = "Add a tag to tag property";

	enableSetting: CommandSettingItem = {
		commandId: this.id,
		id: "enable",
		name: "Enable",
		type: "toggle",
	};

	settings = [this.enableSetting];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
		const file = cmctx.mustGetActiveFile();
		const tagName = await openPrompt("Enter tag name", "", true, false);
		if (tagName == null) {
			throw new Error("tagName is null");
		}
		myutil.addTag(file, tagName);
	}
}
