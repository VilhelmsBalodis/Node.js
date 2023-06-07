// console.log(arguments);
// console.log(require("module").wrapper);

//modeule.exports
const Calculator = require("./test-module-1");
const calc1 = new Calculator();
console.log(calc1.add(2, 9));

//exports
// const calc2 = require("./test-module-2");
const { add, substract, multiply, divide } = require("./test-module-2");
console.log(add(2, 9));

//catching
require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
