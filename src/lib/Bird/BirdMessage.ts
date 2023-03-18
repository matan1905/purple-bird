
export enum ToBirdMessageType{
    ADD_BOINT,
    REMOVE_BOINT,
}

export enum FromBirdMessageType{
    ADDED_BOINT,
    REMOVED_BOINT,
    BOINT_REACHED
}
export type BirdMessage = {
    type:ToBirdMessageType | FromBirdMessageType;
    payload:any;
}