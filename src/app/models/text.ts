import { Imessage } from "./Imessage";

export class TextMessage implements Imessage {

  constructor(
    public _id:string,
    public text: string) { }

}
