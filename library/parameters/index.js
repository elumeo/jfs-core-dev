const { format }= require('../io/ansi.js');

class Parameters
{
  constructor(options)
  {
    this.options = options;
    const parameters = process.argv.slice(2, process.argv.length);
    const parsedParameters = parameters.map(parameter => this.parse(parameter));
    this.args = parsedParameters.length ? Object.assign(...parsedParameters) : {};
    if (options.required.one)
    {
      const exclusiveOptionNames = options.required.one;
      let count = 0;
      Object.keys(this.args).map(argName =>
      {
        if (exclusiveOptionNames.includes(argName)) count++;
      });
      if (count > 1)
      {
        const message = [
          '\n'.repeat(1),
          '\nToo many options! Choose one of\n\n',
          exclusiveOptionNames.map((name, index) => format(
            `${index ? ' ' : ''}--${name}`,
            { control: ['italic'] }
          )).join('\n'),
          '\n'.repeat(3)
        ].join(' ');

        throw message;
      }
      if (count < 1)
      {
        const message = [
          '\n'.repeat(1),
          '\nNot enough options! Choose one of\n\n',
          exclusiveOptionNames.map((name, index) => format(
            `${index ? ' ' : ''}--${name}`,
            { control: ['italic'] }
          )).join('\n'),
          '\n\nIf you are running this script through npm you have to',
          format(
            `add -- before the script parameters`,
            { control: ['bold'], color: { foreground: 'red' } }
          ),
          '\nExample: ',
          format(
            `"npm run`,
            { control: ['bold'], color: { foreground: 'green' } }
          ),
          format(
            `script`,
            { control: ['bold', 'italic'], color: { foreground: 'green' } }
          ),
          format(
            `--`,
            { control: ['bold'], color: { foreground: 'green' } }
          ),
          format(
            `--option`,
            { control: ['bold', 'italic'], color: { foreground: 'green' } }
          ),
          format(
            `"`,
            { control: ['bold'], color: { foreground: 'green' } }
          ),
          '\n'.repeat(3)
        ].join(' ');

        throw message;
      }
    }
  }

  parse(rawParameter)
  {
    if (!rawParameter.includes('=')) return this.parseBool(rawParameter);
    return this.parseAssignment(rawParameter);
  }

  parseBool(rawName)
  {
    const parameter = {};
    const name = rawName.substring(2, rawName.length);
    parameter[name] = true;
    return parameter;
  }

  parseAssignment(rawParameter)
  {
    const parameter = {};
    rawParameter = rawParameter.split('=');
    const rawName = rawParameter[0];
    const rawValue = rawParameter[1];
    const name = rawName.substring(2, rawName.length);
    const value = this.parseValue(rawValue);
    parameter[name] = value;
    return parameter;
  }

  parseValue(value)
  {
    let pointCount = 0;
    for (let i = 0; i < value.length; i++)
    {
      const code = value.charCodeAt(i);
      const isNumber = code >= 48 && code <= 57;
      const isPoint = code === 46;
      const validCharacter = isNumber || isPoint && ++pointCount <= 1;
      if (!validCharacter) return value;
    }
    return parseFloat(value);
  }

  get(name)
  {
    return this.args[name];
  }
}

module.exports = Parameters;
