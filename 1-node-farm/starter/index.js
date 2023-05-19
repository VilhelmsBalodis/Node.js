const fs = require("fs");
const http = require("http");
const url = require("url");

/*
//blocking, synchronous way
const inputText = fs.readFileSync("./txt/input.txt", "utf-8"); // path to file, character encoding
console.log(inputText);
const outputText = `This is what we know about the avocado: ${inputText}.\nCreated on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", outputText);

//non-blocking, asynchronous way
fs.readFile("./txt/start.txt", "utf-8", (error, data1) => {
  if (error) return console.log("Error 😕")
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (error, data2) => {
    console.log(data2);
    fs.readFile("./txt/append.txt", "utf-8", (error, data3) => {
      console.log(data3);
      fs.writeFile(
        "./txt/final.txt",
        `${data2}\n${data3}`,
        "utf-8",
        (error) => {
          console.log("File has been written");
        }
      );
    });
  });
});
console.log("Will read file");
*/

//server

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const products = JSON.parse(data);

const server = http.createServer((req, res) => {
  const path = req.url;
  if (path === "/" || path === "/overview") {
    res.end("this is overview");
  } else if (path === "/product") {
    res.end("this is product");
  } else if (path === "/api") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(data);
  } else {
    res.writeHead(404, {
      "content-type": "text/html",
      "my-own-header": "hello world",
    });
    res.end("<h1>page not found</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Server listening for reques on port 8000");
});
