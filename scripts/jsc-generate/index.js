const axios = require('axios');
const commandLineArgs = require('command-line-args');

const { Project } = require('../../library/project/project.js');
const { Directory } = require('../../library/filesystem/directory.js');

const core = new Directory(__dirname, '..', '..');

const project = new Project('.');

const options = commandLineArgs([{ name: 'version', alias: 'v', type: Number }]);

const jfs = {};

jfs.config = {};
jfs.config.file = project.file('config.json.dist');
jfs.config.file.read(string =>
{
  jfs.config.json = JSON.parse(string);

  const jsc = {};

  jsc.endpoint = jfs.config.json.Client.Host + '/client/generated/v2';
  if (options && options.version === 1) {
    jsc.endpoint = jfs.config.json.Client.Host + '/client/generated/';
  }

  jsc.current = {};
  jsc.current.file = project.directory('src').directory('base').file('JscApi.ts');

  const log =
  {
    success: () => console.log("√ New JscApi File '" +jsc.current.file.path +"' successfully created"),
    error:
    {
      network: e => console.log('Network Error => ', 'HTTP: ', e.response.status, e.response.statusText),
      system: e => console.log('System Error => ', e)
    }
  }

  project.file('jscApiConfig.json').read(string =>
  {
    jsc.config = JSON.parse(string);

    try
    {
      axios.post(jsc.endpoint, jsc.config).then(response =>
      {
        if (response)
        {
          jsc.current.file.write(response.data, () =>
          {
            log.success();
          });
        }
      }).catch(log.error.network);
    }
    catch (err)
    {
      log.error.system(err.message);
    }
  });
});
