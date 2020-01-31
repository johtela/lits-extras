import * as mocha from 'mocha'
import { html } from 'lit-html'

export class MochaReporter extends mocha.reporters.Base {
    constructor(runner: mocha.Runner) {
        super(runner)
        
    }
}



export function runMochaTest(params: string, parent: HTMLElement) {

}