const axios = require('axios');
const commandLineArgs = require('command-line-args');
const {Project} = require('../../library/project/project.js');

const project = new Project('.');
const options = commandLineArgs([
    {name: 'version', alias: 'v', type: Number},
    {name: 'clientPath', type: String}
]);
const jfs = {};

jfs.config = {};
jfs.config.file = project.file('config.json.dist');
jfs.config.file.read(string => {
    jfs.config.json = JSON.parse(string);

    const jsc = {};

    jsc.endpoint = jfs.config.json.JscClient.Host + '/client/generated/v2';
    if(options) {
        if (options.version && options.version === 1) {
            jsc.endpoint = jfs.config.json.JscClient.Host + '/client/generated/';
        }

        if (options.clientPath && options.clientPath !== '') {
            jsc.endpoint += '?options=clientPath:' + options.clientPath;
        }
    }

    jsc.current = {};
    jsc.current.file = project.directory('src').file('JscApi.ts');

    project.file('jscApiConfig.json').read(string => {
        jsc.config = JSON.parse(string);

        try {
            axios.post(jsc.endpoint, jsc.config).then(response => {
                if (response) {
                    jsc.current.file.write(response.data, () => {
                        console.log(
                            `√ New JscApi File '${jsc.current.file.path}' successfully created`
                        )
                    });
                }
            }).catch(e => {
                console.log(e);
                console.log('-----');
                console.log(`Network Error => HTTP: ${e.response.status} ${e.response.statusText}`)
            });
        } catch (err) {
            console.error(`System Error => ${err.message}`)
        }
    });
});
