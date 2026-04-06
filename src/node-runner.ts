/**
 * # Command Line Tester
 * 
 * Node based command line test runner.
 */
import * as tester from './tester'
import { performance } from 'perf_hooks'

export async function runTests(): Promise<number> {
    let timer: tester.Timer = performance
    tester.setTimer(timer)
    let passed = 0
    let failed = 0
    let start = timer.now()
    for await (let result of tester.runTests()) {
        if (result.passed)
            passed++
        else
            failed++
        testResult(result)
    }
    let dur = Math.round(timer.now() - start)
    console.log(`${passed} tests passed and ${failed} failed in ${dur}ms`)
    return failed > 0 ? -1 : 0
}

function testResult(result: tester.TestResult) {
    assertion(result)
    result.assertions.forEach(a => assertion(a, "    "))
}

function assertion(assertion: tester.Assertion, indent = "") {
    let statusIcon = assertion.passed ? "✅" : "❌"
    console.log(`${indent}${statusIcon} ${assertion.message}`)
}