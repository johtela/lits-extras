import * as tr from './test-reporter'
import * as tester from './tester'

export class TestRunner extends HTMLElement {
    private body: HTMLElement
    private connected: boolean
    private styles = /*css*/`
        .test-runner {
            font-family: var(--sans-font);
            font-size: 1rem;
            overflow: auto;
        }    
        .test-runner .summary {
            font-weight: bolder;
        }
        .test-runner .summary .count {
            margin-left: 1rem;
        }
        .test-runner pre {
            background-color: #fff0f0;
        }`

    constructor() {
        super();
        let shadow = this.attachShadow({ mode: 'open' })
        let sheet = new CSSStyleSheet()
        sheet.replaceSync(this.styles)
        shadow.adoptedStyleSheets = [ sheet ]
        this.body = this.elem('div', "test-runner")
        shadow.appendChild(this.body)
        this.connected = false
    }

    connectedCallback() {
        if (this.connected)
            return
        this.connected = true
        let name = this.getAttribute("name")
        this.runTests(name)
    }
    
    runTests(name: string) {
        tester.getHarness().report(tr.createReporter(name, status => {
            while (this.body.firstChild)
                this.body.firstChild.remove()
            this.body.appendChild(this.testStatus(status))
        }))
    }
    
    elem<K extends keyof HTMLElementTagNameMap>(tagName: K, cls?: string,
        text?: string): HTMLElement {
        let res = document.createElement(tagName)
        if (cls)
            res.classList.add(cls)
        if (text)
            res.innerText = text
        return res
    }
    
    statusIcon(assertion: tr.Assertion): string {
        return assertion.pass ? "✅" : "❌"
    }

    testStyle(test: tr.Test) {
        return test.pass ? '#f8fff8' : '#fff8f8'
    }

    testStatus(rootTest: tr.Test): HTMLElement {
        let vis = this.elem("div","test-visualizer")
        vis.style.backgroundColor = this.testStyle(rootTest)
        let sum = this.elem("div", "summary", `${this.statusIcon(rootTest)} ${
            rootTest.name}`)
        sum.appendChild(this.elem("span", "count", `Pass: ${rootTest.passes}`))
        sum.appendChild(this.elem("span", "count", `Fail: ${rootTest.fails}`))
        vis.appendChild(sum)
        vis.appendChild(this.testList(rootTest.tests))
        return vis
    }

    testList(tests: tr.Test[]): HTMLElement {
        let lst = this.elem("ol", "test-list")
        for (let i = 0; i < tests.length; i++)
            lst.appendChild(this.test(tests[i]))
        return lst
    }

    assertion(assertion: tr.Assertion): HTMLElement {
        return this.elem("li", undefined, `${this.statusIcon(assertion)} ${
            assertion.name}`)
    }

    assertions(assertions: tr.Assertion[]): HTMLElement {
        let det = this.elem("details")
        det.appendChild(
            this.elem("summary", undefined, `${assertions.length} assertions`))
        let ol = this.elem("ol")
        for (let i = 0; i < assertions.length; i++) 
            ol.appendChild(this.assertion(assertions[i]))
        det.appendChild(ol)
        return det
    }

    test(test: tr.Test): HTMLElement {
        if (test.error)
            return this.bailedOutTest(test)
        let li = this.elem("li", undefined, 
            `${this.statusIcon(test)} ${test.name} in ${test.duration}ms`)
        if (test.assertions)
            li.appendChild(this.assertions(test.assertions))
        if (test.tests)
            li.appendChild(this.testList(test.tests))
        return li
    }

    bailedOutTest(test: tr.Test): HTMLElement {
        let res = this.elem("li")
        res.innerHTML =
            `${this.statusIcon(test)} ${test.name} threw <b>${
                test.error.name}</b> exception:
            <br/><b>${test.error.message}</b>
            <pre>${test.error.stack}</pre>`
        return res
    }
}

customElements.define('test-runner', TestRunner)