import * as zora from 'zora'

let harness = zora.createHarness()
if (typeof window === 'undefined')
    setTimeout(runTests, 0)

export function getHarness(): zora.TestHarness{
    return harness
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
    return harness.test(description, spec, options)
}