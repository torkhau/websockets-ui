import WebSocket from 'ws';

export class WSCommunicator {
  private ws: WebSocket;

  constructor(ws: WebSocket) {
    this.ws = ws;

    ws.on('message', this.readerMessages.bind(this));
  }

  private readerMessages(message: string) {
    const msg = JSON.parse(message);
    console.log(msg);
    this.senderMessages({
      type: 'reg',
      data: JSON.stringify({
        name: '12345',
        index: 1,
        error: false,
        errorText: '',
      }),
      id: 0,
    });
  }

  private senderMessages(message: object) {
    this.ws.send(JSON.stringify(message));
  }
}
