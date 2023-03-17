import inspector, {Debugger, InspectorNotification, Session} from "inspector";
import DefaultBirdCommunicator from "./DefaultBirdCommunicator";
import {BirdMessage, FromBirdMessageType, ToBirdMessageType} from "./BirdMessage";
import {BirdCommunicator} from "./BirdCommunicator";

export default class Bird {
    session: Session;
    communicator:BirdCommunicator
    activeBreakpoints=[]
    constructor(communicator: DefaultBirdCommunicator = new DefaultBirdCommunicator()) {
        communicator.initialize(this.onMessage)
        this.communicator=communicator
    }
    async start(){
        await this.communicator.isReady()
        this.startSession()
        this.setBoint('',{fileName:'',line:0}) // remove
    }



    private onMessage(message:BirdMessage){
        if(!message || !message.type){
            console.error("Received invalid message, check your bird communicator")
        }
        switch (message.type){
            case ToBirdMessageType.NEW_POINT:
                this.setBoint(message.id,message.payload)
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
                        prev[curr.key] = JSON.parse(curr.value)
                        return prev;
                    },{})))
                }))



            }
            return Promise.all(scopePromises)

        }

    private setBoint(msgId:string,{line: number, fileName: string}){
        this.session.post("Debugger.setBreakpointByUrl", {
            lineNumber: 21, // the line number where you want to set the breakpoint
            urlRegex: ".*todo-server.js$",
        },(e,params)=>{
            if(e){
                // report error
            } else{
                this.activeBreakpoints.push(params.breakpointId)
                this.communicator.onBirdMessage({
                    id:msgId,
                    type:FromBirdMessageType.REGISTERED_BOINT,
                    payload:{
                        breakpointId:params.breakpointId
                    }

                })
                // Send id back to client
            }
        });
    }

    private removeBoint(breakpointId){
        this.session.post('Debugger.removeBreakpoint',{breakpointId:breakpointId})
    }


}

