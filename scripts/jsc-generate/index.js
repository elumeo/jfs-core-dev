const axios = require('axios');
const commandLineArgs = require('command-line-args');
const {Project} = require('../../library/project/project.js');

const project = new Project('.');
const options = commandLineArgs([{name: 'version', alias: 'v', type: Number}]);
const jfs = {};

jfs.config = {};
jfs.config.file = project.file('config.json.dist');
jfs.config.file.read(string => {
  jfs.config.json = JSON.parse(string);

  const jsc = {};

  jsc.endpoint = jfs.config.json.Client.Host + '/client/generated/v2';
  if (options && options.version === 1) {
    jsc.endpoint = jfs.config.json.Client.Host + '/client/generated/';
  }

  jsc.current = {};
  jsc.current.file = project.directory('src').file('JscApi.ts');

  project.file('jscApiConfig.json').read(string => {
    jsc.config = JSON.parse(string);

    try {
      axios.post(jsc.endpoint, jsc.config).then(response => {
        if (response) {
          let data = response.data.replace(
              /import\s+client\s+from\s+["']@elumeo\/jfs-core\/app\/base\/Client["']\s*;\n/,
              "import client from '\@elumeo/jfs-core/src/base/Client';"
          );
          if (!data.includes("import client from '\@elumeo/jfs-core/src/base/Client';")) {
            data = "import client from '\@elumeo/jfs-core/src/base/Client';\n" + data;
          }
          jsc.current.file.write(data, () => {
            console.log(
                `√ New JscApi File '${jsc.current.file.path}' successfully created`
            )
          });
        }
      }).catch(e => {
        console.log(
            `Network Error => HTTP: ${e.response.status} ${e.response.statusText}`
        )
      });
    } catch (err) {
      console.error(`System Error => ${err.message}`)
    }
  });
});
