import {AppServer} from "./todo-server";
import Bird from "./Bird/Bird";



new Bird().start().then(x=>{
    AppServer()
})
