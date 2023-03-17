import {BirdCommunicator} from "./BirdCommunicator";
import {BirdMessage} from "./BirdMessage";

export default class DefaultBirdCommunicator implements BirdCommunicator {
    initialize(sendMessageFunction: (message: BirdMessage) => void): void {
    }

    onBirdMessage(message: BirdMessage): void {
    }

    isReady(): Promise<boolean> {
        return Promise.resolve(true);
    }




}