import * as tr from './test-reporter'
import * as tester from './tester'
import { html, render } from 'lit-html'

export function runTests(params: string, parent: HTMLElement) {
    window.addEventListener('load', () =>
        tester.getHarness().report(tr.createReporter(status => 
            render(renderTestStatus(status), parent))))
}

function assertPass(assertion: tr.Assertion): string {
    return assertion.pass ? "✅" : "❌"
}

const renderTestStatus = (rootTest: tr.Test) => html`
    <div class="summary">
        ${assertPass(rootTest)}
        <span>Pass: </span>
        <span class="count">${rootTest.passes}</span>
        <span>Fail: </span>
        <span class="count">${rootTest.fails}</span>
    </div>
    ${renderTestList(rootTest.tests)}
`

const renderTestList = (tests: tr.Test[]) => html`
    <ol class="test-list">
        ${tests.map(renderTest)}
    </ol>
` 
const renderAssertion = (assertion: tr.Assertion) => html`
    <li>
        ${assertPass(assertion)} ${assertion.name}     
    </li>
`

const renderAssertions = (assertions: tr.Assertion[]) => html`
    <details>
        <summary>${assertions.length} assertions</summary>
        <ol>
            ${assertions.map(renderAssertion)}
        </ol>
    </details>
`

const renderTest = (test: tr.Test) => html` 
    <li>
        ${assertPass(test)} ${test.name} in ${test.duration}ms
        ${test.assertions ? renderAssertions(test.assertions) : ""}
        ${test.tests ? renderTestList(test.tests) : ""}
    </li>`