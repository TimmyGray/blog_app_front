import { Imessage } from "./Imessage";

export class Article {

  constructor(
    public _id: string,
    public date: Date,
    public message: Imessage,
    public username: string) { }

}
