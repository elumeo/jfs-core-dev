const ChangeLog = require('../../library/project/changeLog.js');
const { Project } = require('../../library/project/project.js');
const Parameters = require('../../library/parameters/index.js');
const Version = require('../../library/project/version.js');

const parameterOptions = { required: { one: ['hotfix', 'minor', 'major'] } };
const parameters = new Parameters(parameterOptions);
const project = new Project;
const modules = project.directory('node_modules');
const webpack = modules.directory('webpack').directory('bin').file('webpack.js');
const { packageJSON } = project;

project.git.log((error, logs) => {
  if (error) throw error;

  project.changeLog.latestVersionHash(hash => {

    if (hash !== logs.latest.hash)
    {
      const commitRange = {
        from: logs.latest.hash,
        to: hash
      };

      project.run('node', [webpack.path, '--env=prod'], (code, task) =>
      {
        if (code === 0)
        {
          for (const versionName of ['major', 'minor', 'hotfix'])
          {
            if (parameters.get(versionName))
            {
              packageJSON.getVersion(version =>
              {
                version.bump(versionName);
                packageJSON.setVersion(version);

                project.git.log(commitRange, (error, logs) => {
                  if (error) throw error;

                  const log = {
                    version: version.toString(),
                    messages: logs.all.map(entry => entry.message)
                  }

                  project.changeLog.addLog(log, () => {

                  });
                });

              });
              break;
            }
          }
        }
        else console.log('Cannot not release because of building errors');
      });
    }
    else console.log('There are no commits since last release');
  });
});
