import { requestUrl } from "obsidian";

import { removeFrontmatterWithContentArray } from "myutil";

export const chatAI = async (params: any) => {
	const openAIApiKey =
		app.plugins.plugins["obsidian-textgenerator-plugin"].settings.api_key;

	const reqBody = Object.assign(
		{
			model: "gpt-4o",
			top_p: 0.1,
			messages: [{ role: "user", content: "Say Hi." }],
			max_tokens: 4096,
		},
		params
	);

	const reqParams = {
		url: "https://api.openai.com/v1/chat/completions",
		method: "POST",
		contentType: "application/json",
		headers: {
			Authorization: `Bearer ${openAIApiKey}`,
		},
		throw: true,
		body: JSON.stringify(reqBody),
	};

	let response = null;
	let retryCount = 0;
	while (true) {
		if (retryCount > 3) {
			break;
		}

		try {
			response = await requestUrl(reqParams);
			break;
		} catch (e) {
			retryCount++;
			console.log(e);
			await sleep(5000);
		}
	}

	if (response === null) {
		return null;
	}

	const data = response.json;
	return data.choices[0].message.content;
};

export const translateToJapanese = async (content: string) => {
	const batchsize = 200;
	const parallelNum = 4;

	const contentArray = content.split("\n");
	const contentArrayWithoutFrontmatter =
		removeFrontmatterWithContentArray(contentArray);
	const chunkedContent = splitArrayIntoChunk<string[]>(
		splitArrayIntoChunk<string>(contentArrayWithoutFrontmatter, batchsize),
		parallelNum
	);

	function translate(c: string) {
		return chatAI({
			model: "gpt-3.5-turbo-0125",
			messages: [
				{
					role: "system",
					content: "次のコンテンツを日本語に翻訳してください。",
				},
				{
					role: "user",
					content: c,
				},
			],
		});
	}
	let translatedText = "";
	for (const chunk of chunkedContent) {
		let results = await Promise.all(
			chunk.map((lines: string[]) => {
				const c = lines.join("\n");
				if (c.trim().length === 0) {
					return "";
				}
				return translate(lines.join("\n"));
			})
		);
		if (results !== undefined) {
			translatedText += results.join("\n");
		}
	}

	return translatedText;
};

export const summarize = async (content: string) => {
	return chatAI({
		model: "gpt-4-0125-preview",
		messages: [
			{
				role: "system",
				content:
					"次のコンテンツを要約し、読者の理解を深めるための問いと回答を7つ添えて、マークダウンでかつ日本語で出力してください。",
			},
			{
				role: "user",
				content: content,
			},
		],
	});
};

function splitArrayIntoChunk<T>(array: T[], chunkSize: number) {
	const result = Array.from(
		{ length: Math.ceil(array.length / chunkSize) },
		(_, index) => array.slice(index * chunkSize, (index + 1) * chunkSize)
	);
	return result;
}
