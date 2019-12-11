import * as path from 'path'
import * as fs from 'fs'
import { genCode } from './index'
import first from 'lodash/fp/first'
import last from 'lodash/fp/last'
export default class coder {
    get codeTemplate() {
        return fs.readFileSync(path.dirname(__filename) + "/../coder.template").toString()
    }
    private _code: string = '';
    get code() {
        return this._code.length > 0 || fs.existsSync(this.outputPath) ? fs.readFileSync(this.outputPath).toString() : '';
    }
    set code(val: string) {
        this._code = val;
        fs.writeFileSync(this.outputPath, val);
    }
    constructor(private outputPath: string) { }
    write(name: string, template: string, force: boolean = true) {
        const tag = this.getTag(name);
        if (!this.hasCode(name)) {
            this.code = `${this.legal ? this.code : this.codeTemplate}${tag.start}${genCode(name, template)}${tag.sign}${tag.end}`;
            return true;
        }
        if (this.hasCode(name) && force) {
            this.removeCode(name)
            this.code = `${this.legal ? this.code : this.codeTemplate}${tag.start}${genCode(name, template)}${tag.sign}${tag.end}`;
            return true;
        }
        return false;
    }
    get legal() {
        return this.code.length > 0 && this.code.includes('/*{#test_end#}*/')
    }
    getTag(name: string) {
        return {
            start: `\n/*{#${name}_start#}*/\n`,
            end: `\n/*{#${name}_end#}*/\n`,
            sign: `\n/*${new Date().toString()}*/\n`
        }
    }
    private removeCode(name: string) {
        if (this.legal) {
            const tag = this.getTag(name);
            this.code = `${first(this.code.split(tag.start))}\n${last(this.code.split(tag.end))}`;
        }
    }
    private hasCode(name: string) {
        const tag = this.getTag(name);
        const code = this.code
        if (!code) {
            return false;
        }
        if (code.includes(tag.start) && code.includes(tag.end)) {
            return true;
        }
        if (code.includes(tag.start) || code.includes(tag.end)) {
            throw new Error(`code error [${name}]`)
        }
        return false;
    }
};