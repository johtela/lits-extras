import * as zora from 'zora'

let harness: zora.TestHarness

export function getHarness(): zora.TestHarness{
    return harness
}

export function setHarness(value: zora.TestHarness) {
    harness = value
}

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
    if (!harness) {
        harness = zora.createHarness()
        runTests()
    }
    return harness.test(description, spec, options)
}