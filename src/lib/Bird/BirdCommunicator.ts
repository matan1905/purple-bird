import {BirdMessage} from "./BirdMessage";

export interface BirdCommunicator {
    onBirdMessage(message: BirdMessage): void;

    initialize(sendMessageFunction: (message: BirdMessage) => void): void;

   waitUntilReady(): Promise<void>;
}