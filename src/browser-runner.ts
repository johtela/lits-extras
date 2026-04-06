import * as tester from './tester'

export class BrowserRunner extends HTMLElement {
    private body: HTMLElement
    private connected: boolean
    private styles = /*css*/`
        .test-runner {
            font-family: var(--sans-font);
            font-size: 1rem;
            color: black;
        }    
        .test-visualizer {
            overflow: auto;
            max-height: 100vh;
        }
        .test-runner .summary {
            font-weight: bolder;
        }
        .test-runner .summary .count {
            margin-left: 1rem;
        }
        .test-runner pre {
            background-color: #fff0f0;
        }
        summary {
            cursor: pointer;
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
        window.requestIdleCallback(() => this.runTests())
    }
    
    async runTests() {
        while (this.body.firstChild)
            this.body.firstChild.remove()
        let visualizer = this.testVisualizer()
        let summary = this.testSummary(visualizer)
        let list = this.testList(visualizer)
        let passed = 0
        let failed = 0
        for await (let result of tester.runTests()) {
            if (result.passed)
                passed++
            else
                failed++
            this.updateSummary(summary, passed, failed)
            list.append(this.testResult(result))
        }
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
    
    statusIcon(result: tester.Assertion): string {
        return result.passed ? "✅" : "❌"
    }

    statusColor(passed: boolean) {
        return passed ? '#f8fff8' : '#fff8f8'
    }

    testVisualizer(): HTMLElement {
        let res = this.elem("div", "test-visualizer")
        this.body.append(res)
        return res
    }
    
    testSummary(visualizer: HTMLElement): HTMLElement {
        let summary = this.elem("div", "summary")
        summary.appendChild(this.elem("span", "count", "Pass: 0"))
        summary.appendChild(this.elem("span", "count", "Fail: 0"))
        visualizer.appendChild(summary)
        return summary
    }

    updateSummary(summary: HTMLElement, passed: number, failed: number) {
        summary.style.backgroundColor = this.statusColor(failed == 0);
        (summary.firstElementChild as HTMLElement).innerText = 
            `Pass: ${passed}`;
        (summary.lastElementChild as HTMLElement).innerText = 
            `Fail: ${failed}`
    }

    testList(visualizer: HTMLElement): HTMLElement {
        let lst = this.elem("ol", "test-list")
        visualizer.append(lst)
        return lst
    }

    testResult(result: tester.TestResult): HTMLElement {
        let li = this.elem("li", undefined, 
            `${this.statusIcon(result)} ${result.message}`)
        if (result.assertions)
            li.appendChild(this.assertions(result.assertions))
        return li
    }

    assertions(assertions: tester.Assertion[]): HTMLElement {
        let det = this.elem("details")
        det.appendChild(
            this.elem("summary", undefined, `${assertions.length} assertions`))
        let ol = this.elem("ol")
        for (let i = 0; i < assertions.length; i++) 
            ol.appendChild(this.assertion(assertions[i]))
        det.appendChild(ol)
        return det
    }

    assertion(assertion: tester.Assertion): HTMLElement {
        return this.elem("li", undefined, `${this.statusIcon(assertion)} ${
            assertion.message}`)
    }
}

customElements.define('test-runner', BrowserRunner)