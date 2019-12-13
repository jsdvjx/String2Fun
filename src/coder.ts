import * as path from 'path'
import * as fs from 'fs'
import { genCode } from './index'
import first from 'lodash/fp/first'
import last from 'lodash/fp/last'
export default class coder {
    private get codeTemplate() {
        return fs.readFileSync(path.dirname(__filename) + "/../coder.template").toString()
    }
    private outputPath: string;
    private _code: string = '';
    private get code() {
        return this._code.length > 0 ? this._code : fs.existsSync(this.outputPath) ? fs.readFileSync(this.outputPath).toString() : '';
    }
    private set code(val: string) {
        this._code = val;
        fs.writeFileSync(this.outputPath, val);
    }
    constructor(outputPath?: string) {
        this.outputPath = outputPath || (path.dirname(__filename) + "/../coder_cache.ts");
    }
    write(name: string, template: string, force: boolean = true) {
        if (!this.hasCode(name)) {
            this.code = this.getCode(name, template);
            return true;
        }
        if (this.hasCode(name) && force) {
            this.removeCode(name)
            this.code = this.getCode(name, template)
            return true;
        }
        return false;
    }
    getCode(name: string, template: string) {
        const tag = this.getTag(name);
        return `${this.legal ? this.code : this.codeTemplate}${tag.start}${genCode(name, template)}${tag.sign}${tag.end}`;
    }
    private get legal() {
        return this.code.length > 0 && this.code.includes('/*{#template_included#}*/')
    }
    private getTag(name: string) {
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