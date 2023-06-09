import inspector, {Session} from "inspector";
import DefaultBirdCommunicator from "./DefaultBirdCommunicator";
import {BirdMessage, FromBirdMessageType, ToBirdMessageType} from "./BirdMessage";
import {BirdCommunicator} from "./BirdCommunicator";
import {escapeRegExp} from "./utils";

export default class Bird {
    session: Session;
    communicator:BirdCommunicator
    activeBreakpoints={}
    constructor(communicator: DefaultBirdCommunicator = new DefaultBirdCommunicator()) {
        communicator.initialize(this.onMessage.bind(this))
        this.communicator=communicator
    }
    async start(){
        await this.communicator.waitUntilReady()
        this.startSession()
    }



    private onMessage(message:BirdMessage){
        if(!message || message.type===undefined){
            console.error("Received invalid message, check your bird communicator", message)
        }
        switch (message.type as ToBirdMessageType){
            case ToBirdMessageType.ADD_BOINT:
                this.setBoint(message.payload)
                break;
            case ToBirdMessageType.REMOVE_BOINT:
                this.removeBoint(message.payload)
                break;

        }
    }

    private startSession(){
        this.session = new inspector.Session();
        this.session.connect();
        this.session.post("Runtime.enable");
        this.session.post("Debugger.enable");

        this.session.on("Debugger.paused", async (event) => {
            if(event.params.hitBreakpoints && event.params.hitBreakpoints.length>0) {
                this.reachedBoint(event,await this.extractScope(event))
            }
            this.session.post("Debugger.resume"); // isn't necessary unless ran with --inspect-brk, adding just in case.
        });
    }


    private reachedBoint(event,scopeVariables){
        const ref = Object.keys(this.activeBreakpoints).find(key=>event.params.hitBreakpoints==this.activeBreakpoints[key])
        this.communicator.onBirdMessage({
            type:FromBirdMessageType.BOINT_REACHED,
            payload:{
                scopeVariables,
                ref
            }
        })
    }

    /*
    * This function extracts all the scope, session.post can only work with callback
    * but I wanted it to get all the scope values asynchronously so I added a lot of promises to wrap things up
    * */
    private extractScope(event){
            const scopePromises =[]
            for (let i = 0; i < event.params.callFrames[0].scopeChain.length; i++) {
                const scope = event.params.callFrames[0].scopeChain[i];
                if(scope.type=='global') continue;
                scopePromises.push( new Promise(scopeResolve => {
                    const valuePromises=[]
                    this.session.post('Runtime.getProperties', {
                        objectId: scope.object.objectId,
                    },(e,properties)=>{
                        if(properties)
                            for (let property of properties.result) {
                                if(!property.value) continue
                                    if(property.value.type=='object') {
                                        valuePromises.push(new Promise((valueResolve,reject)=>{
                                            this.session.post('Runtime.callFunctionOn', {
                                                objectId: property.value.objectId,
                                                functionDeclaration: 'function() { return JSON.stringify(this); }'
                                            }, (e, result) => {
                                                if (result?.result?.value) {
                                                    valueResolve({key:property.name,value: result.result.value});
                                                } else valueResolve(undefined)
                                            })
                                        }))
                                    } else if(property.value.value){
                                       valuePromises.push(Promise.resolve({key:property.name,value: property.value.value}))
                                    }
                            }
                    })
                    Promise.all(valuePromises).then(arr=>scopeResolve(arr.filter(x=>x).reduce((prev,curr)=>{
                        try{
                            prev[curr.key] = JSON.parse(curr.value)
                        }
                        catch (e) {
                            prev[curr.key] = curr.value
                        }
                        return prev;
                    },{})))
                }))



            }
            return Promise.all(scopePromises)

        }

    private setBoint(payload:{ ref:string,line: number, fileName: string,}){
        this.session.post("Debugger.setBreakpointByUrl", {
            lineNumber: payload.line, // the line number where you want to set the breakpoint
            urlRegex: `.*${escapeRegExp(payload.fileName)}$`,
        },(e,params)=>{
            if(!e){
                if(this.activeBreakpoints[payload.ref]){
                    this.removeBoint(payload.ref)
                }
                this.activeBreakpoints[payload.ref]=params.breakpointId
                this.communicator.onBirdMessage({
                    type:FromBirdMessageType.ADDED_BOINT,
                    payload:{
                        ref:payload.ref,
                        breakpointId:params.breakpointId
                    }

                })
            }
        });
    }

    private removeBoint(ref){
        this.session.post('Debugger.removeBreakpoint',{breakpointId:this.activeBreakpoints[ref]})
        this.communicator.onBirdMessage({
            type:FromBirdMessageType.REMOVED_BOINT,
            payload:{
                ref:ref,
            }
        })
        delete this.activeBreakpoints[ref]
    }


}

