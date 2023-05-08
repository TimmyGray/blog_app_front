import { Imessage } from "./Imessage";

export class MediaMessage implements Imessage {

  constructor(
    public _id: string,
    public msgvalue: Blob,
    public type:string) { }

}
