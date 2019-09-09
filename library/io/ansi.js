const escape = code => ['\033[', code.toString(), 'm'].join('');

const code =
{
  color:
  {
    black: 0,
    red: 1,
    green: 2,
    yellow: 3,
    blue: 4,
    magenta: 5,
    cyan: 6,
    white: 7,
    default: 9,
  },
  control:
  {
    reset: 0,
    bold: 1,
    faint: 2,
    italic: 3,
    underline: 4,
    blink: 5,
    reverse: 7
  }
}

const offset =
{
  foreground: 30,
  background: 40
}

const color = {};
for (const layer in offset)
{
  color[layer] = {};
  for (const name in code.color)
  {
    color[layer][name] = escape(offset[layer] +code.color[name]);
  }
  color[layer].lightblue = '\033[1;34m';
}

const control = {};
for (const name in code.control)
{
  control[name] = escape(code.control[name]);
}

module.exports.format = (message, options = {}) =>
{
  const modifiers = [];
  if (options.color)
  {
    for (const layer in options.color) if (Object.keys(color).includes(layer))
    {
      modifiers.push(color[layer][options.color[layer]]);
    }
  }

  if (options.control)
  {
    for (const modifier of options.control)
    {
      if (Object.keys(control).includes(modifier)) modifiers.push(control[modifier]);
    }
  }

  modifiers.push(message, control.reset);

  return modifiers.join('');
}
