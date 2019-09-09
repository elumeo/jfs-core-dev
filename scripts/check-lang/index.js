const opn = require('opn');

const { Project } = require('../../library/project/project.js');
const { File } = require('../../library/filesystem/file.js');

const project = new Project('.');
const src = project.directory('src');

const buildWebPage = (config = {}) =>
{
  if (!config.script) config.script = '';
  if (!config.style) config.style = '';
  const { script, style } = config;

  const html =
  `<!DOCTYPE html>
  <html lang="de" dir="ltr">
    <head>
      <meta charset="utf-8">
      <title></title>
      <style>${style}</style>
    </head>
    <body>
      <script>
        ${script}
      </script>
    </body>
  </html>`;

  return html;
}

const latestVersion = (pathInitializer, callback) =>
{
  let index = 0;
  let file;

  do
  {
    file = src.file(pathInitializer(++index));
    if (index === 1 && !file.exists) callback(file, null);
  } while (file.exists);

  callback(src.file(pathInitializer(--index)), index);
}

const getVersionFile = (pathInitializer, callback) =>
{
  latestVersion(pathInitializer, (file, index) =>
  {
    if (!index) callback(file, index);
    else callback(file, index);
  });
}

const onDataChange = (pathInitializer, dataString, callback) =>
{
  getVersionFile(pathInitializer, (file, index) =>
  {
    if (index === 0) return;
    !file.exists
      ? file.create(() => file.write(dataString, () => callback(file, index)))
      : file.read(string =>
        {
          if (string !== dataString)
          {
            const next = src.file(pathInitializer(index +1));
            next.create(() => next.write(dataString, () => callback(next, index +1)));
          }
          else callback(file, index);
        })
  });
}

const translations = require(src.file('Translations.json').path);
const langs = Object.keys(translations);
const keys = new Set();
let incompleteKeys = new Set();
const missing = {};

langs.map(lang => Object.keys(translations[lang]).map(key => keys.add(key)));
langs.map(lang =>
{
  missing[lang] = [];
  Array.from(keys).map(key => !translations[lang][key]
    ? missing[lang].push(key) && incompleteKeys.add(key)
    : null
  );
});

incompleteKeys = Array.from(incompleteKeys);

if (incompleteKeys.length)
{
  const titleRow = {};
  titleRow.name = `Keys(${incompleteKeys.length})`;
  langs.map(lang => titleRow[lang] = lang);

  const dataRows = [];
  incompleteKeys.map(key =>
  {
    const dataRow = {};
    dataRow.name = key;
    langs.map(lang =>
    {
      dataRow[lang] = translations[lang][key] ? translations[lang][key] : '';
    });
    dataRows.push(dataRow);
  });

  const buildRow = (columnOrder, data) =>
  {
    return columnOrder.map(key => data[key]).join(',');
  }

  const columnOrder = ['name', ...langs];

  const csv = [];
  [titleRow, ...dataRows].map(data => csv.push(buildRow(columnOrder, data)));
  const csvString = csv.join('\n');

  const pathInitializer = index => `missing.translations.v${index}.csv`;
  onDataChange(pathInitializer, csvString, (csvFile, index) =>
  {
    csvFile.write(csvString, () => {});

    const js = new File(__dirname, 'script.js');
    const css = new File(__dirname, 'style.css');

    js.read(code =>
    {
      css.read(style =>
      {
        const html = buildWebPage({
          script:
          `const data = ${JSON.stringify([titleRow, ...dataRows])};
          const project_name = ${JSON.stringify(project.name)};
          const csvPath = ${JSON.stringify(csvFile.path)};
          ${code}`,
          style: style
        });

        const htmlFile = src.file(`missing.translations.v${index === null ? 1 : index}.html`);

        htmlFile.create(() => htmlFile.write(html, () =>
        {
          opn(htmlFile.path);
        }));
      });
    });
  });
}
else
{
  console.log('There are no translations missing');
  src.files(files =>
  {
    files.map(file =>
    {
      const pattern = 'missing.translations.v';
      const match = file.name.substring(0, pattern.length) === pattern;
      if (match) file.remove(() => {});
    });
  })
}
