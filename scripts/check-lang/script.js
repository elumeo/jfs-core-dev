const body = document.getElementsByTagName('body')[0];

const header = document.createElement('div');
const title = document.createElement('h1');
const anchor = document.createElement('a');
anchor.innerHTML = 'Load CSV';

title.innerHTML = `Missing translations in ${project_name}`;
anchor.href = csvPath;

header.appendChild(title);
header.appendChild(anchor);

body.appendChild(header);

const table = document.createElement('table');
data.map((dataRow, rowIndex) =>
{
  const tableRow = document.createElement('tr');

  rowIndex ? null : tableRow.className = 'title';

  const dataColumns = Object.keys(dataRow);
  dataColumns.splice(dataColumns.indexOf('name'), 1);

  const columnHead = document.createElement('td');
  columnHead.innerHTML = dataRow.name;
  tableRow.appendChild(columnHead);

  dataColumns.map(columnName =>
  {
    const rowColumn = document.createElement('td');
    console.log(rowColumn);
    rowColumn.innerHTML = dataRow[columnName];
    tableRow.appendChild(rowColumn);
  });

  table.appendChild(tableRow);
});

body.appendChild(table);
