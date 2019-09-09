const axios = require('axios');
const { Project } = require('../../library/project/project.js');
const { Directory } = require('../../library/filesystem/directory.js');

const core = new Directory(__dirname, '..', '..');

const project = new Project('.');

const parse = {};
parse.version = string =>
{
  return (/export const JSC_API_VERSION: string = '(.*)';/g).exec(string)[1];
}

const jfs = {};

jfs.config = {};
jfs.config.file = project.file('config.json.dist');
jfs.config.file.read(string =>
{
  jfs.config.json = JSON.parse(string);

  const jsc = {};
  jsc.current = {};
  jsc.endpoint = jfs.config.json.Client.Host +'/client/generated/v2';
  jsc.current.file = core.directory('app').directory('base').file('JscApi.ts');
  jsc.current.file.read(string =>
  {
    jsc.current.api = string;
    jsc.current.version = parse.version(string);

    project.file('jscApiConfig.json').read(string =>
    {
      jsc.config = JSON.parse(string);

      axios.post(jsc.endpoint, jsc.config).then(response =>
      {
        if (response)
        {
          const latest = {};
          latest.version = parse.version(response.data);
          if (latest.version !== jsc.current.version)
          {
            console.log("The JscApi has been changed - please review and update");
          }
          else
          {
            console.log('√ The JscApi is up to date - nothing to do');
            return true;
          }
        }
      });
    });
  });
});
