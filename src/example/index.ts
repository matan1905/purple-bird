import {AppServer} from "./todo-server";
import Bird from "../lib/Bird/Bird";



new Bird().start().then(()=>{
    console.log('Ready for some debuggin')
})
AppServer()
