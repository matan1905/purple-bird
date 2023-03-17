import express from "express";

interface Todo {
    id: number;
    task: string;
}

let todos: Todo[] = [];
let nextId = 1;
export function AppServer() {
    const app = express();
    app.use(express.json());

    app.get("/todos", (req, res) => {
        console.log('a')
        res.send(todos);
    });

    app.post("/todos", (req, res) => {
        const task = req.body.task;
        const newTodo = { id: nextId++, task };
        todos.push(newTodo);
        res.send(newTodo);
    });

    app.delete("/todos/:id", (req, res) => {
        const id = parseInt(req.params.id);
        todos = todos.filter(todo => todo.id !== id);
        res.sendStatus(204);
    });

    app.listen(3000, () => {
        console.log("Server is listening on port 3000");
    });
}
