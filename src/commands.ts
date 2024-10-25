import { CommandWithContext } from "commandWithContext";

import { AddTagPropertyCommand } from "command/addTagProperty";
import { CreateMemoFromSelectionCommand } from "command/createMemoFromSelection";
import { CreateNoteFromSelectionCommand } from "command/createNoteFromSelection";
import { CreateQuotedNoteFromSelectionCommand } from "command/createQuotedNoteFromSelection";
import { AddLinkToDailyNoteCommand } from "command/addLinkToDailyNote";
import { AddBlockLinkToDailyNoteCommand } from "command/addBlockLinkToDailyNote";
import { CreateDailyNoteViewer } from "command/createDailyNoteViewer";
import { ReadCompletion } from "command/readCompletion";
import { Fav } from "command/fav";
import { GetActiveNoteFileNameCommand } from "command/getActiveNoteFilePath";

export const commands: CommandWithContext[] = [
    new AddTagPropertyCommand(),
    new CreateMemoFromSelectionCommand(),
    new CreateNoteFromSelectionCommand(),
    new CreateQuotedNoteFromSelectionCommand(),
    new AddLinkToDailyNoteCommand(),
    new AddBlockLinkToDailyNoteCommand(),
    new CreateDailyNoteViewer(),
    new ReadCompletion(),
    new Fav(),
    new GetActiveNoteFileNameCommand(), 
];
