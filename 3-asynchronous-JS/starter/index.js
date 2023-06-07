const fs = require('fs');
const { resolve } = require('path');
const superagent = require('superagent');

const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('file not found');
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject('could not write file');
    });
    resolve('file written');
  });
};

/*
// with promises
readFilePromise(`${__dirname}/dog.txt`)
  .then((data) => {
    console.log(`breed: ${data}`);
    return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`); // returns resolved promise
  })
  .then((res) => {
    console.log(res.body.message);
    return writeFilePromise('dog-img.txt', res.body.message);
  })
  .then(() => {
    console.log('random dog image saved');
  })
  .catch((err) => {
    if (err) return console.log(err.message);
  });
*/

// with async/await
const getDogPicture = async () => {
  try {
    const data = await readFilePromise(`${__dirname}/dog.txt`);
    const res = await superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    await writeFilePromise('dog-img.txt', res.body.message);
    console.log(`breed: ${data},`, `${res.body.message}, `, `${data} dog image saved`);
  } catch (err) {
    console.log(err.message);
  }
};
getDogPicture();
