import * as tr from './test-reporter'
import * as tester from './tester'
import { html, render } from 'lit-html'
import { TcpSocketConnectOpts } from 'net'

export function runTests(params: string, parent: HTMLElement) {
    window.addEventListener('load', () =>
        tester.getHarness().report(tr.createReporter(status => 
            render(renderTestStatus(status), parent))))
}

const renderTestStatus = (rootTest: tr.Test) => html`
    <div class="summary">
        <span>Pass: </span>
        <span class="count">${rootTest.passes}</span>
        <span>Fail: </span>
        <span class="count">${rootTest.fails}</span>
    </div>
    ${renderTestList(rootTest.tests)}
`

const renderTestList = (tests: tr.Test[]) => html`
    <ul class="test-list">
        ${tests.map(renderTest)}
    </ul>
` 
const renderAssertion = (assertion: tr.Assertion) => html`
    <li>
        ${assertion.name} ${assertion.pass ? "PASSED " : "FAILED"}     
    </li>
`

const renderAssertions = (assertions: tr.Assertion[]) => html`
    <details>
        <summary>Assertions</summary>
        <ul>
            ${assertions.map(renderAssertion)}
        </ul>
    </details>
`

const renderTest = (test: tr.Test) => html` 
    <li>
        ${test.name} ${test.pass ? "PASSED " : "FAILED"} in ${test.duration}ms
        ${test.assertions ? renderAssertions(test.assertions) : ""}
        ${test.tests ? renderTestList(test.tests) : ""}
    </li>`