
![Logo](./images/logo.png)
# Summary
Purple bird is a project I've done over the weekend to explore nodejs remote debugging capabilities.
it uses the V8 inspector runtime api together with a suite of communication protocols to allow debugging from anywhere<sup>1</sup>

There is a lot to be done and it's not perfect, but it was an insightful weekend. 



[1] After some changes, as this was only tested on localhost

# Features
* Set non-breaking breakpoints (Boints) on any line of your code
* locally run web-ide to display variables at the scope of the boints

# Running the examples
Start by cloning the repository, and installing dependencies:
```bash
git clone https://github.com/matan1905/purple-bird.git && cd purple-bird && npm install
```

The next step would be to run the example todo server. it is already loaded with purple-bird sdk.
you can see it over at /src/examples/todo-server.ts
```bash
npm run example
```
Then you will need to run the debugging interface.
make sure you run it from the root of the Purple bird repository:
```bash
cd web-ide
PROJECT_DIR=$(pwd)/../build npm run dev
```
The Web IDE should now be available over at: http://localhost:3000


This will show you the file system of the resulting build process, where you can put any breakpoint you would like, and it will display you the debugging  information.

For example, in the web ide, you can go to /build/example/todo-server.js and place a Boint on line 20, after that you can go ahead and run the following curl which adds a todo:
```bash
curl --request POST \
  --url http://localhost:3200/todos \
  --header 'Content-Type: application/json' \
  --data '{
	"task": "Check out the web ide for debug data"
}'
```
and return to the web ide to see it.

# Todo
This project was done over the span of a weekend, there is a lot of missing parts and probably many bugs.
but this is the gist of what's left to do:
- [ ] Proper testing to see how it behaves beyond the examples
- [ ] Allow typescript sources directly by converting line numbers
- [ ] Review code for bad practices and implementing better ones
- [ ] Wrap V8 Inspector with an async equivalent for better readability
- [ ] Rework the architecture, create a dedicated relay server
