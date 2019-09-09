const utilities =
{
  number: {},
  char: {}
};

utilities.number.between = (number, lower, upper) => lower < number && number < upper;
utilities.number.range = (number, lower, upper) => lower <= number && number <= upper

utilities.char.is =
{
  uppercase: char => utilities.number.range(char.charCodeAt(0), 65, 90),
  lowercase: char => utilities.number.range(char.charCodeAt(0), 97, 122),
  number: char => utilities.number.range(char.charCodeAt(0), 48, 57),
}

utilities.char.is.alpha = char =>
{
  const {uppercase, lowercase} = utilities.char.is;
  return uppercase(char) || lowercase(char);
}

utilities.char.switch = char =>
{
  if (utilities.char.is.uppercase(char)) return char.toLowerCase();
  if (utilities.char.is.lowercase(char)) return char.toUpperCase();
  if (char === '_') return '-';
  if (char === '-') return '_';
  return char;
}

utilities.char.type = char =>
{
  for (const type in utilities.char.is)
  {
    if (utilities.char.is[type](char)) return type;
  }
}

utilities.string = {};
utilities.string.replace = (string, index, value, size = 1) =>
{
  const prologue = string.substring(0, index);
  const epilogue = string.substring(index +size, string.length);
  return prologue +value +epilogue;
}


utilities.string.switch = (string, index = 0) =>
{
  const switched = utilities.char.switch(string[index]);
  return utilities.string.replace(string, index, switched);
}

utilities.string.remove =
{
  prefix: (string, prefix) =>
  {
    const remove = string.indexOf(prefix) === 0;
    if (remove) return string.substring(prefix.length, string.length);
    return string;
  },
  suffix: (string, suffix) =>
  {
    const remove = string.indexOf(suffix) !== string.length -suffix.length;
    if (remove) string.substring(0, string.length -string.length -suffix.length)
    return string;
  }
}

utilities.string.variants = (string) =>
{
  const variants = [];

  for (let i = 0; i < string.length; i++)
  {
    variants.push(utilities.string.switch(string, i));
  }

  return variants;
}

utilities.string.standardize = (string, value) =>
{
  for (const variant of utilities.string.variants(value))
  {
    let position;
    do {
      position = string.indexOf(variant);
      if (position === -1) break;
      string = utilities.string.replace(string, position, value, variant.length);
    } while (position !== -1)
  }

  return string;
}

utilities.string.common = (first, second) =>
{
  let common = '';

  let start = 0;
  while(start <= first.length)
  {
    let end = first.length;
    if (end -start < common.length) break;
    while(end >= 0)
    {
      if (end -start < common.length) break;
      const substring = first.substring(start, end);
      if (second.indexOf(substring) !== -1) common = substring;
      end--;
    }
    start++;
  }

  return common;
}

utilities.array = {};

utilities.array.commons = (array) =>
{
  const commons = [];
  for (let i = 0; i < array.length; i++)
  {
    if (i > 0)
    {
      const first = array[i -1];
      const second = array[i];
      commons.push(utilities.string.common(first, second));
    }
  }
  return commons;
}

utilities.array.assertive = (array) =>
{
  let counter = {}, max = 0, common;
  for (const member of array)
  {
    if (!counter[member]) counter[member] = 0;
    counter[member]++;
    if (counter[member] > max)
    {
      max = counter[member];
      common = member;
    }
  }

  return common;
}

utilities.bool = {};

utilities.bool.toggle = (bool) =>
{
  if (bool) return false;
  return true;
}

module.exports.utilities = utilities;
