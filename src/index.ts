import {upperFirst} from 'lodash/fp'
import _coder from './coder';
export const coder = _coder;
interface RegexDict {
    [k: string]: RegExp;
}
interface StrParameter {
    [k: string]: string;
}

export interface Maker<T> {
    (p: T): string
}
function j2i(types: [string, string][], name: string) {
    if(types.length===0)return `type ${name} = void;`
    if (types.length === 1) {
        return `type ${name} = ${types[0][1] || 'string'};`
    }
    return `interface ${name} {
${types.reduce((result, [name, type]) => {
        return [...result, `    ${name}: ${type || 'string'};`];
    }, [] as string[]).join('\n')}
}`
}
function createInterfaceJson(template: string) {
    return Array.from(new Set(template.match(/\{(.+?)\}+/g) || []))
        .map(s => s.replace(/[\{\}]/g, ''))
        .map(s => s.split(":"))
}
export function genCode(name: string, template: string) {
    const paramName = `${upperFirst(name)}Param`;
    const text = j2i(createInterfaceJson(template) as any, paramName)
    const result = `
export ${text}
export const ${name} = createFun<${paramName}>(\`${template}\`)
`;
    return result
}
function createDict(tmp: string) {
    const reg = /\{(.+?)\}+/g;
    const dict = Array.from(new Set(tmp.match(reg) || []))
        .map(s => ({
            name: s.replace(/[\{\}]/g, '').split(":").shift() || '',
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
function createFun<T>(string: string) {
    const dict = createDict(string);
    return ((parameter: T) => {
        if (parameter) {
            const type = typeof parameter;
            switch (type) {
                case 'bigint':
                case 'boolean':
                case 'number':
                case 'string':
                    return string.replace(Object.values(dict).pop() || '', (parameter as any).toString())
                case 'object':
                default:
                    return Object.entries(parameter).reduce(
                        (str, [k, v]) => str.replace(dict[k], v),
                        string,
                    )
            }

        } else {
            return string;
        }
    }
    ) as Maker<T>;
}