const { File } = require('../filesystem/file.js');

class ChangeLog extends File
{
  constructor(project)
  {
    super(project.path, 'CHANGELOG.md');
    this.project = project;
  }

  readLogs(callback)
  {
    this.read(string =>
    {
      const sections = string.split('---');
      const titleSection = sections.shift();
      const versionSections = sections.map(versionSection =>
      {
        const versionSectionParts = versionSection.split('\n\n');
        versionSectionParts.shift();
        const versionSectionTitle = versionSectionParts.shift();
        const versionSectionMessages = versionSectionParts[0];

        return {
          version: versionSectionTitle.substring(3, versionSectionTitle.length),
          messages: versionSectionMessages.split('\n').map(versionSectionMessage =>
            versionSectionMessage.substring(2, versionSectionMessage.length)
          )
        };
      });

      callback({
        title: titleSection.substring(2, titleSection.indexOf('\n')),
        versions: versionSections
      });
    });
  }

  addLog(log, callback)
  {
    this.readLogs(({ title, versions }) =>
    {
      versions.unshift(log);

      this.write([
        `# ${title}\n\n`,
        ...versions.map(versionLog => [
          '',
          '',
          `## ${versionLog.version}`,
          '',
          ...versionLog
            .messages
            .filter(versionMessage => versionMessage.length)
            .map(versionMessage => `- ${versionMessage}`),
          '',
          ''
        ].join('\n'))
      ].join('---'), () => {

        const versionMap = this.project.file('.version-map');

        versionMap.read(string => {
          this.project.git.log((error, logs) => {
            versionMap.write(`${log.version} ${logs.latest.hash}\n${string}`, () => {
              callback();
            });
          });
        });

      });
    });
  }

  latestVersionHash(callback)
  {
    this.project.file('.version-map').read(string => {
      callback(string.split('\n')[0].split(' ')[1]);
    });
  }
}

module.exports = ChangeLog;
