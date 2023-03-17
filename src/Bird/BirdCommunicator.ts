import {BirdMessage} from "./BirdMessage";

export interface BirdCommunicator {
    onBirdMessage(message: BirdMessage): void;

    initialize(sendMessageFunction: (message: BirdMessage) => void): void;

   isReady(): Promise<boolean>;
}