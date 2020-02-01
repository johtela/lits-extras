import * as Mocha from 'mocha/browser-entry'
import * as mr from './mocha-reporter'
import { html, render } from 'lit-html'

export function runMochaTest(params: string, parent: HTMLElement) {
    new Mocha().reporter(typeof mr.MochaReporter, status =>
        render(renderTestStatus(status), parent)).run()
}

const renderTestStatus = (status: mr.TestStatus) => html`
    <div class="summary">
        <span>Pass: </span>
        <span class="count">${status.passes}</span>
        <span>Fail: </span>
        <span class="count">${status.fails}</span>
    </div>
    <ul class="test-list">
        ${status.tests.map(renderTest)}
    </ul>
`

const renderTest = (test: mr.Test) => html` 
    <li>
        ${test.name + test.pass ? " Passed" : " Failed" }
    </li>`