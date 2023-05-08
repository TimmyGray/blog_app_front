import { Imessage_validator } from "./Imessage_validator";
import { TextMessage } from "./text";

export class TextValidator implements Imessage_validator {

  messageEmptyValidator(message: TextMessage): boolean {

    if (message.msgvalue == '') {
      return false;
    }
    return true;

  };

}
