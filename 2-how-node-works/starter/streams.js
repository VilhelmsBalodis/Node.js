const fs = require("fs");
const server = require("http").createServer();

server.on("request", (req, res) => {
  // solution 1, do not use for production environment only something small
  // fs.readFile("test-file.txt", (error, data) => {
  //   if (error) console.log(error);
  //   res.end(data);
  // });

  // solution 2: streams, use "data" and "end" events specifically
  // const readable = fs.createReadStream("test-file.txt");
  // readable.on("data", (chunk) => {
  //   res.write(chunk);
  // });
  // readable.on("end", () => {
  //   res.end();
  // });
  // readable.on("error", (error) => {
  //   console.log(error);
  //   res.statusCode(500);
  //   res.end("file not found");
  // });

  // solution 3: pipe operator
  const readable = fs.createReadStream("test-file.txt");
  readable.pipe(res); //readableSource.pipe(writableDestination)
});

server.listen(8000, "127.0.0.1", () => {
  console.log("waiting for requests...");
});
