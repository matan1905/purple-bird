import inspector, {Session} from "inspector";

export default class Bird {
    session: Session;
    constructor() {
        console.log(__dirname)
    }
    start(){
        this.startSession()
    }

    startSession(){
        this.session = new inspector.Session();
        this.session.connect();
        this.session.post("Runtime.enable");
        this.session.post("Debugger.enable");
        this.session.post("Debugger.setBreakpointByUrl", {
            lineNumber: 14, // the line number where you want to set the breakpoint
            urlRegex: ".*todo-server.js$",
        },(e,p)=>{
            console.log(e,p)
        });
        this.session.on("Debugger.paused", async (event) => {
            console.log(JSON.stringify(event))
            this.session.post("Debugger.resume");
        });
    }

    setNonBreakpoint(line:number,){

    }
}