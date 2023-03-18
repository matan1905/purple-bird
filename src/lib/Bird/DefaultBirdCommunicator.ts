import {BirdCommunicator} from "./BirdCommunicator";
import {BirdMessage, FromBirdMessageType, ToBirdMessageType} from "./BirdMessage";
import WebSocket from "ws";

export default class DefaultBirdCommunicator implements BirdCommunicator {
    readyState;
    ws:WebSocket

    initialize(sendMessageFunction: (message: BirdMessage) => void): void {
        const ws = new WebSocket('ws://localhost:3001');
        this.ws =ws
       this.readyState= new Promise((resolve)=>{
            ws.on('open', function() {
                resolve(true)
            });

            ws.on('message', function(data) {
                try{
                    const msg = JSON.parse(data.toString())
                    switch (msg.type){
                        case 'addBoint':
                            sendMessageFunction({
                                type:ToBirdMessageType.ADD_BOINT,
                                payload:msg.payload
                            })
                            break;
                        case 'removeBoint':
                            sendMessageFunction({
                                type:ToBirdMessageType.REMOVE_BOINT,
                                payload:msg.payload
                            })
                            break;

                    }
                }
                catch (e) {
                    // error parsing, probably
                    console.log(e)
                }
            });

        })

    }

    onBirdMessage(message: BirdMessage): void {
        switch (message.type){
            case FromBirdMessageType.ADDED_BOINT:
                this.ws.send(JSON.stringify({
                    type:'addedBoint',
                    payload:message.payload
                }))
                break;
            case FromBirdMessageType.REMOVED_BOINT:
                this.ws.send(JSON.stringify({
                    type:'removedBoint',
                    payload:message.payload
                }))
                break;
            case FromBirdMessageType.BOINT_REACHED:
                this.ws.send(JSON.stringify({
                    type:'bointReached',
                    payload:message.payload
                }))
                break;

        }
    }

    waitUntilReady(): Promise<void> {
        if (!this.readyState) throw "waitUntilReady called before initialization"
        return this.readyState;
    }


}