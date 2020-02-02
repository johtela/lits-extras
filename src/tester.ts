import * as zora from 'zora'

let harness = zora.createHarness()
let testfn: zora.TestFunction = harness.test
runTests()

async function runTests() {
    try {
        await harness.report(zora.mochaTapLike)
    }
    catch {
        harness.pass = false
    }
    if (harness.pass)
        console.log('Tests PASSED')
    else
        console.log('Tests FAILED')
    process.exit(harness.pass ? 0 : 1)
}

export function test(description: string, spec: zora.SpecFunction, 
    options?: object): Promise<zora.TestResult> {
    return testfn(description, spec, options)
}

export function setTestFn(value: zora.TestFunction) {
    testfn = value
}