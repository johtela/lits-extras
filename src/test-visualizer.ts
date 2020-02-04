import * as tr from './test-reporter'
import * as tester from './tester'
import { html, render } from 'lit-html'

export function runTests(params: string, parent: HTMLElement) {
    window.addEventListener('load', () =>
        tester.getHarness().report(tr.createReporter(status => 
            render(renderTestStatus(status), parent))))
}

function statusIcon(assertion: tr.Assertion): string {
    return assertion.pass ? "✅" : "❌"
}

const renderTestStatus = (rootTest: tr.Test) => html`
    <div class="summary">
        ${statusIcon(rootTest)}
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
        ${statusIcon(assertion)} ${assertion.name}     
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
        ${statusIcon(test)} ${test.name} in ${test.duration}ms
        ${test.assertions ? renderAssertions(test.assertions) : ""}
        ${test.tests ? renderTestList(test.tests) : ""}
    </li>`