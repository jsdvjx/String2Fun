import { compose, last, upperFirst, toLower } from 'lodash/fp'
import j2i from 'json-to-ts'
import _coder from './coder';
export const coder = _coder;
interface RegexDict {
    [k: string]: RegExp;
}
interface StrParameter {
    [k: string]: string;
}

function createDict(string: string) {
    const reg = /\{(.+?)\}+/g;
    const dict = Array.from(new Set(string.match(reg) || []))
        .map(s => ({
            name: s.replace(/[\{\}]/g, ''),
            target: new RegExp(`${s}`, 'g'),
        }))
        .reduce(
            (t, acc) => {
                t[acc.name] = acc.target;
                return t;
            },
            {} as RegexDict,
        );
    return dict;
}
function createInterfaceJson(template: string) {
    return Array.from(new Set(template.match(/\{(.+?)\}+/g) || []))
        .map(s => ({
            name: s.replace(/[\{\}]/g, ''),
            target: 'string',
        }))
        .reduce(
            (t, acc) => {
                t[acc.name] = acc.target;
                return t;
            },
            {} as StrParameter,
        );

}
export function genCode(name: string, template: string) {
    const paramName = `${upperFirst(name)}Param`;
    const tmp = template.replace(/--.*\s*/g, '\n');
    const text = last(j2i(createInterfaceJson(tmp) as any, { rootName: paramName }))
    const result = `
export ${text}
export const ${name} = createFun<${paramName}>(\`${tmp}\`)
`;
    return result
}

export default function createFun<T = StrParameter>(string: string) {
    const dict = createDict(string);
    return (parameter: T) =>
        Object.entries(parameter).reduce(
            (str, [k, v]) => str.replace(dict[k], v),
            string,
        );
}
