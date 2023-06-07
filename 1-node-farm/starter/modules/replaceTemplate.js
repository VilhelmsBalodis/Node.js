module.exports = (template, element) => {
  let output = template.replace(/{%id%}/g, element.id);
  output = output.replace(/{%product__name%}/g, element.productName);
  output = output.replace(/{%image%}/g, element.image);
  output = output.replace(/{%product__from%}/g, element.from);
  output = output.replace(/{%product__nutrients%}/g, element.nutrients);
  output = output.replace(/{%product__pieces%}/g, element.quantity);
  output = output.replace(/{%product__price%}/g, element.price);
  output = output.replace(/{%product__desc%}/g, element.description);
  if (!element.organic)
    output = output.replace(/{%not_organic%}/g, "not-organic");
  return output;
};
