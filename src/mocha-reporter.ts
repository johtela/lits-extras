import * as Mocha from 'mocha/browser-entry'

export interface Test {
    name: string
    pass: boolean
    error?: string
}

export interface TestStatus {
    passes: number
    fails: number
    tests: Test[]
    done: boolean
}

export class MochaReporter extends Mocha.reporters.Base {
    constructor(runner: Mocha.Runner, render: (status: TestStatus) => void) {
        super(runner)
        let status: TestStatus
        runner.on('start', () => {
            status = {
                passes: 0,
                fails: 0,
                tests: [],
                done: false
            }
            render(status)
        })
        runner.on('end', () => { 
            status.done = true
            render(status)
        })
        runner.on('pass', test => {
            status.tests.push({
                name: test.fullTitle(),
                pass: true
            })
            status.passes++
            render(status)
        })
        runner.on('fail', (test, err) => { 
            status.tests.push({
                name: test.fullTitle(),
                pass: false,
                error: err.toString()
            })
            status.fails++
            render(status)
        })        
    }
}