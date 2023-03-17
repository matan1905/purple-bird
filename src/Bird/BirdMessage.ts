
export enum ToBirdMessageType{
    NEW_POINT
}

export enum FromBirdMessageType{
    REGISTERED_BOINT
}
export type BirdMessage = {
    id:string;
    type:ToBirdMessageType | FromBirdMessageType;
    payload:any;
}