const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

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

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const products = JSON.parse(data);
const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const templateProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const slugs = products.map((product) => slugify(product.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  //overview
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'content-type': 'text/html' });
    const cardsHtml = products.map((e) => replaceTemplate(templateCard, e)).join('');
    const output = templateOverview.replace('{%Product_cards%}', cardsHtml);
    res.end(output);
    //product
  } else if (pathname === '/product') {
    res.writeHead(200, { 'content-type': 'text/html' });
    const product = products[query.id];
    const output = replaceTemplate(templateProduct, product);
    res.end(output);
    //api
  } else if (pathname === '/api') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(data);
  } else {
    // not found
    res.writeHead(404, {
      'content-type': 'text/html',
      'my-own-header': 'hello world',
    });
    res.end('<h1>page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Server listening for reques on port 8000');
});
