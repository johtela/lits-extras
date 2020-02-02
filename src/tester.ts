import * as zora from 'zora'

let harness = zora.createHarness()
let testfn: zora.TestFunction = harness.test
harness.report(zora.mochaTapLike)

export function test(description: string, spec: zora.SpecFunction, 
    options?: object): Promise<zora.TestResult> {
    return testfn(description, spec, options)
}

export function setTestFn(value: zora.TestFunction) {
    testfn = value
}