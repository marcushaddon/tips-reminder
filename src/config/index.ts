import * as fs from 'fs';
import * as path from 'path';
import yaml from 'js-yaml';
const mergedeep = require('merge-deep');

const getConfig = (env: string) => {
    const cfig = yaml.safeLoad(fs.readFileSync(path.join(__dirname, `../../config/${env}.yaml`)).toString());

    return cfig;
}

const baseConfig = getConfig('default');
const extraConfig = process.env.NODE_ENV && [ 'develop', 'test', 'prod' ].indexOf(process.env.NODE_ENV) ? getConfig(process.env.NODE_ENV) : {};

const toConfig = (obj: { [key: string]: any } ): { [key: string]: any } => ({
    ...obj,
    get(field: string) {
        if (!this[field]) {
            throw new Error(`${field} isn CONFIGURED`);
        }
        if (!Array.isArray(this[field]) && typeof(this[field])  === 'object') {
            return toConfig(this[field]);
        }
        return this[field];
    }
})

const merged = mergedeep(baseConfig, extraConfig);

const config = toConfig(merged);

export default config;
