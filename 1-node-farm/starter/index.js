const fs = require("fs");

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
