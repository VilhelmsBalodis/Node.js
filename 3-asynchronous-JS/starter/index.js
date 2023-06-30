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
    const res1 = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const res2 = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const res3 = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
    const all = await Promise.all([res1, res2, res3]);
    const imgs = all.map((el) => el.body.message);
    console.log(imgs);
    await writeFilePromise('dog-img.txt', imgs.join('\n'));
    console.log(`breed: ${data},`, `${data} dog image saved`);
  } catch (err) {
    console.log(err.message);
    throw err;
  }
  return '2';
};

/*
console.log('1');
getDogPicture()
.then((x) => {
  console.log(x);
  console.log('3');
})
.catch((err) => {
  console.log(err);
});
*/

(async () => {
  try {
    console.log('1');
    const x = await getDogPicture();
    console.log(x);
    console.log('3');
  } catch (err) {
    console.log(err);
  }
})();
