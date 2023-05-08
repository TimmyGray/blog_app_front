import { Injectable } from '@angular/core';
import { Imessage } from '../models/Imessage';
import { Imessage_validator } from '../models/Imessage_validator';
import { MediaMessage } from '../models/media';
import { MediaValidator } from '../models/media_validator';
import { TextMessage } from '../models/text';
import { TextValidator } from '../models/text_validator';

@Injectable({
  providedIn: 'root'
})
export class ValidatorService {

  constructor() {}

  private createValidator(message: Imessage): Imessage_validator|null {

    if (message as TextMessage) {
      return new TextValidator();
    }
    if (message as MediaMessage) {
      return new MediaValidator();
    }
    return null;
  }

  messageValidate(message: Imessage): boolean {

    let validator = this.createValidator(message);
    if (validator) {
      return validator.messageEmptyValidator(message);
    }
    console.log('error with valodator');
    return false;
  }

}
