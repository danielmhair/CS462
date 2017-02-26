export class Rumor {
  messageId: string;
  originator: string;
  text: string;

  constructor(messageId: string, originator: string, text: string) {
    this.messageId = messageId;
    this.originator = originator;
    this.text = text;
  }
}
