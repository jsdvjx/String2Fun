interface RegexDict {
    [k: string]: RegExp;
}
interface StrParameter {
    [k: string]: string | number;
}

function createDict(string: String) {
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
export default function createFun<T = StrParameter>(string: String) {
    const dict = createDict(string);
    return (parameter: T) =>
        Object.entries(parameter).reduce(
            (str, [k, v]) => str.replace(dict[k], v),
            string,
        );
}
