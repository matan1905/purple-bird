
export enum ToBirdMessageType{
    NEW_BOINT,
    REMOVE_BOINT,
}

export enum FromBirdMessageType{
    REGISTERED_BOINT,
    BOINT_REACHED
}
export type BirdMessage = {
    type:ToBirdMessageType | FromBirdMessageType;
    payload:any;
}