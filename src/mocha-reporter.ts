import * as mocha from 'mocha'

interface ReporterElems {
    
}

export class MochaReporter extends mocha.reporters.Base {
    constructor(runner: mocha.Runner) {
        super(runner)
        
    }
}

export function runMochaTest(params: string, parent: HTMLElement) {

}