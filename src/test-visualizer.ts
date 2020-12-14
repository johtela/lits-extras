import * as tr from './test-reporter'
import * as tester from './tester'

export function runTests(params: string, parent: HTMLElement) {
    window.addEventListener('load', () => {
        while (parent.firstChild)
            parent.firstChild.remove()
        tester.getHarness().report(tr.createReporter(params, status =>
            parent.appendChild(testStatus(status))))
    })
}

function elem<K extends keyof HTMLElementTagNameMap>(tagName: K, cls?: string,
    text?: string): HTMLElement {
    let res = document.createElement(tagName)
    if (cls)
        res.classList.add(cls)
    if (text)
        res.innerText = text
    return res
}

function statusIcon(assertion: tr.Assertion): string {
    return assertion.pass ? "✅" : "❌"
}

function testStyle(test: tr.Test) {
    return test.pass ? '#f8fff8' : '#fff8f8'
}

function testStatus(rootTest: tr.Test): HTMLElement {
    let vis = elem("div","test-visualizer")
    vis.style.backgroundColor = testStyle(rootTest)
    let sum = elem("div", "summary", `${statusIcon(rootTest)} ${rootTest.name}`)
    sum.appendChild(elem("span", "count", `Pass: ${rootTest.passes}`))
    sum.appendChild(elem("span", "count", `Fail: ${rootTest.fails}`))
    vis.appendChild(sum)
    vis.appendChild(testList(rootTest.tests))
    return vis
}

function testList(tests: tr.Test[]): HTMLElement {
    let lst = elem("ol", "test-list")
    for (let i = 0; i < tests.length; i++)
        lst.appendChild(test(tests[i]))
    return lst
}

function assertion(assertion: tr.Assertion): HTMLElement {
    return elem("li", undefined, `${statusIcon(assertion)} ${assertion.name}`)
}

function assertions(assertions: tr.Assertion[]): HTMLElement {
    let det = elem("details")
    det.appendChild(
        elem("summary", undefined, `${assertions.length} assertions`))
    let ol = elem("ol")
    for (let i = 0; i < assertions.length; i++) 
        ol.appendChild(assertion(assertions[i]))
    det.appendChild(ol)
    return det
}

function test(test: tr.Test): HTMLElement {
    if (test.error)
        return bailedOutTest(test)
    let li = elem("li", undefined, 
        `${statusIcon(test)} ${test.name} in ${test.duration}ms`)
    if (test.assertions)
        li.appendChild(assertions(test.assertions))
    if (test.tests)
        li.appendChild(testList(test.tests))
    return li
}

function bailedOutTest(test: tr.Test): HTMLElement {
    let res = document.createElement("li")
    res.innerHTML =
        `${statusIcon(test)} ${test.name} threw <b>${test.error.name}</b> exception:
        <br/><b>${test.error.message}</b>
        <pre>${test.error.stack}</pre>`
    return res
}