import { Imessage } from "./Imessage";

export class TextMessage implements Imessage {

  constructor(
    public _id:string,
    public msgvalue: string,
    public type:string ) { }

}
