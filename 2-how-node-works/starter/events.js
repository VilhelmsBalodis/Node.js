const EventEmitter = require("events");
const http = require("http");

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

myEmitter.on("newSale", () => {
  //listens for the event
  console.log("there was a new sale");
});
myEmitter.on("newSale", () => {
  // listens for the event
  console.log("customer name: William");
});
myEmitter.on("newSale", (stock) => {
  console.log(`there are now ${stock} items left in stock`);
});

myEmitter.emit("newSale", 9); //emits the event

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("request received");
  res.end("Request received");
});
server.on("request", (req, res) => {
  console.log("Another request received 😁");
});
server.on("close", () => {
  console.log("server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("waiting for requests...");
});
