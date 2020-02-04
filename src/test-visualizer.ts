import * as zora from 'zora'
import * as tr from './test-reporter'
import * as tester from './tester'
import { html, render } from 'lit-html'

tester.setHarness(zora.createHarness())

export function runTests(params: string, parent: HTMLElement) {
    window.addEventListener('load', () =>
        tester.getHarness().report(tr.createReporter(status => 
            render(renderTestStatus(status), parent))))
}

const renderTestStatus = (status: tr.TestStatus) => html`
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

const renderTest = (test: tr.Test) => html` 
    <li>
        ${test.name + (test.pass ? " Passed" : " Failed") }
    </li>`