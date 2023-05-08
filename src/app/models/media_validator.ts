import { Imessage } from "./Imessage";
import { Imessage_validator } from "./Imessage_validator";
import { MediaMessage } from "./media";

export class MediaValidator implements Imessage_validator {

  messageEmptyValidator(message: MediaMessage): boolean {

    if (message.msgvalue) {
      return true;
    }
    return false;

  }


}
