import { CommandWithContext } from "commandWithContext";

import { AddTagPropertyCommand } from "command/addTagProperty";
import { CreateMemoFromSelectionCommand } from "command/createMemoFromSelection";
import { CreateNoteFromSelectionCommand } from "command/createNoteFromSelection";
import { CreateQuotedNoteFromSelectionCommand } from "command/createQuotedNoteFromSelection";
import { CreateChatAISessionFileCommand } from "command/createChatAISessionFile";
import { TranslateToJapaneseCommand } from "command/translateToJapanese";
import { SummarizeCommand } from "command/summarize";
import { DescribeConceptCommand } from "command/describeConcept";
import { DescribeEnglishWardCommand } from "command/describeEnglishWard";
import { DescribeEnglishSentenceCommand } from "command/describeEnglishSentence";
import { AddLinkToDailyNoteCommand } from "command/addLinkToDailyNote";
import { AddBlockLinkToDailyNoteCommand } from "command/addBlockLinkToDailyNote";
import { CreateDailyNoteViewer } from "command/createDailyNoteViewer";
import { ReadCompletion } from "command/readCompletion";
import { Fav } from "command/fav";

export const commands: CommandWithContext[] = [
    new AddTagPropertyCommand(),
    new CreateMemoFromSelectionCommand(),
    new CreateNoteFromSelectionCommand(),
    new CreateQuotedNoteFromSelectionCommand(),
    new CreateChatAISessionFileCommand(),
    new TranslateToJapaneseCommand(),
    new SummarizeCommand(),
    new DescribeConceptCommand(),
    new DescribeEnglishWardCommand(),
    new DescribeEnglishSentenceCommand(),
    new AddLinkToDailyNoteCommand(),
    new AddBlockLinkToDailyNoteCommand(),
    new CreateDailyNoteViewer(),
    new ReadCompletion(),
    new Fav(),
];
