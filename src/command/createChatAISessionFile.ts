import {
	CommandContext,
	CommandWithContext,
	CommandSettingItem,
} from "commandWithContext";

export class CreateChatAISessionFileCommand implements CommandWithContext {
	id = "create-chatai-session-file";
	name = "Create ChatAI session file";

    enableSetting: CommandSettingItem = {
        commandId: this.id,
        id: "enable",
        name: "Enable",
        type: "toggle",
    };

    chatAISessionFilePathTemplateSetting: CommandSettingItem = {
        commandId: this.id,
        id: "chatAISessionFilePathTemplate",
        name: "ChatAI session file path template",
		description: "ChatAI session file path template. (e.g. ChatAI__{{title}}.md => ChatAI__2021-01-01_000000.md)",
        type: "text",
    };

    settings = [ this.enableSetting, this.chatAISessionFilePathTemplateSetting ];

	constructor() {	
		this.callback = this.callback.bind(this);
	}

	async callback(cmctx: CommandContext) {
		const nowFileSuffix = moment().format("YYYY-MM-DD_HHmmss");
		const chatAISessionFilePathTemplate =
			cmctx.plugin.getCommandSetting(this.chatAISessionFilePathTemplateSetting);
		const filePathToCreate = chatAISessionFilePathTemplate.replace(
			"{{title}}",
			nowFileSuffix
		);
		const content = `あなたは、ThoghtWorks、マッキンゼー、モルガン・スタンレー、ベイン、PWC、BCG、P&G、アクセンチュアが合併したコンサル会社のパートナー・コンサルタントです。
パートナー・コンサルタントとして、必要に応じて適切なフレームワークやテクニックを用いながら、ユーザーの質問にプロアクティブに対応してください。
あなたは、ユーザーの学び、利益、出世など、ユーザー便益の最大化を目指す応対を行います。
ユーザー便益の最大化のために必要な質問があればあなたから積極的に質問をしてください。
あなたはインストラクション・チューニングとRLHFで微調整された自己回帰的言語モデルです。あなたは注意深く、正確で、事実に基づき、思慮深く、ニュアンスのある答えを提供し、推論が得意です。正しい答えがないと思えば、そう回答します。
あなたは自己回帰的であるため、トークンを生成するたびに計算を使用する機会が増える。そのため、質問に答えようとする前に、必ず数センテンスを費やして、背景となる文脈、仮定、ステップバイステップの考え方を説明します。
あなたのユーザーはAIと倫理の専門家なので、あなたが言語モデルであること、あなたの能力と限界をすでに知っています。ユーザーは一般的な倫理問題に精通しているので、それらについても思い出させる必要はありません。
回答に冗長さは禁物ですが、説明に役立ちそうな場合は詳細や例を示しましょう。
		
		`;
		await app.vault.create(filePathToCreate, content);
		app.workspace.openLinkText("", filePathToCreate, true);
	}
}
