import * as tr from './test-reporter'
import * as tester from './tester'
import { html, render } from 'lit-html'
import { styleMap } from 'lit-html/directives/style-map'

export function runTests(params: string, parent: HTMLElement) {
    window.addEventListener('load', () =>
        tester.getHarness().report(tr.createReporter(params, status => 
            render(renderTestStatus(status), parent))))
}

function statusIcon(assertion: tr.Assertion): string {
    return assertion.pass ? "✅" : "❌"
}

function testStyle(test: tr.Test) {
    return {
        backgroundColor: test.pass ? '#f8fff8' : '#fff8f8'
    }
}

const renderTestStatus = (rootTest: tr.Test) => html`
    <div class="test-visualizer" style=${styleMap(testStyle(rootTest))}>
        <div class="summary">
            ${statusIcon(rootTest)} ${rootTest.name}
            <span class="count">Pass: ${rootTest.passes}</span>
            <span class="count">Fail: ${rootTest.fails}</span>
        </div>
        ${renderTestList(rootTest.tests)}
    </div>`

const renderTestList = (tests: tr.Test[]) => html`
    <ol class="test-list">
        ${tests.map(renderTest)}
    </ol>`

const renderAssertion = (assertion: tr.Assertion) => html`
    <li>
        ${statusIcon(assertion)} ${assertion.name}     
    </li>`

const renderAssertions = (assertions: tr.Assertion[]) => html`
    <details>
        <summary>${assertions.length} assertions</summary>
        <ol>
            ${assertions.map(renderAssertion)}
        </ol>
    </details>`

const renderTest = (test: tr.Test) => 
    test.error ? 
        renderBailedOutTest(test) :
        html` 
            <li>
                ${statusIcon(test)} ${test.name} in ${test.duration}ms
                ${test.assertions ? renderAssertions(test.assertions) : ""}
                ${test.tests ? renderTestList(test.tests) : ""}
            </li>`

const renderBailedOutTest = (test: tr.Test) => html`
    <li>
        ${statusIcon(test)} ${test.name} threw <b>${test.error.name}</b> exception:
        <br/><b>${test.error.message}</b>
        <pre>${test.error.stack}</pre>
    </li>`
