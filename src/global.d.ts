import * as moment from 'moment';

declare global {
    const moment: typeof moment;
}

declare module "obsidian" {
    interface App {
        plugins: {
            plugins: {
                "obsidian-hover-editor": {
                    spawnPopover: () => any;
                };
                "obsidian-textgenerator-plugin": {
                    settings: {
                        api_key: string;
                    };
                };
            };
        };
    }
}

