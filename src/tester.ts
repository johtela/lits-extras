/**
 * # Assertions, Reporters, and Tests
 * 
 * Define an exception class for failed assertions.
 */
export class AssertError<T> extends Error {
    /**
     * Constructor specifies what value an assertion expected and what it got.
     */
    constructor(message: string, value1: T, value2?: T) {
        super(value2 != undefined ?
            `${message}.\nValue1: ${value1}\nValue2: ${value2}` :
            `${message}.\nValue: ${value1}`)
    }
}
/**
 * ## Assertions
 * 
 * Different comparisons to assert that test has succeeded.
 */
export class Assert {
    equal<T>(value1: T, value2: T) {
        if (value1 != value2)
            throw new AssertError("Values should be equal", value1, value2)
    }
    notEqual<T>(value1: T, value2: T) {
        if (value1 == value2)
            throw new AssertError("Values should not be equal", value1, 
                value2)
    }
    same<T>(value1: T, value2: T) {
        if (!Object.is(value1, value2))
            throw new AssertError("Values should be the same", value1, value2)
    }
    notSame<T>(value1: T, value2: T) {
        if (Object.is(value1, value2))
            throw new AssertError("Values should not be the same", value1, 
                value2)
    }
    isTrue<T>(value: T) {
        if (value)
            throw new AssertError("Value should be true", value)
    }
    isFalse<T>(value: T) {
        if (value)
            throw new AssertError("Value should not be true", value)
    }
    throws<T extends ErrorConstructor>(func: () => any, error: T) {
        try {
            func()
        }
        catch (e) {
            if (e instanceof error)
                return
        }
        throw new AssertError("Expected to get an exception", 
            error.toString())
    }
}
/**
 * ## Reporter
 * 
 * A test reporter is a function which is called for passed and failed tests. It
 * gets a TestResult object as an argument.
 */
export interface TestResult {
    test: Test
    message: string
    passed: boolean
    error?: Error
    duration?: number
}
export type TestReporter = (result: TestResult) => any
/**
 * There can be only one active reporter at a time. It is registered with
 * `registerReporter` function.
 */
let reporter: TestReporter | undefined
export function registerReporter(report: TestReporter) {
    if (reporter)
        throw new Error("Reporter already registered")
    reporter = report
}
/**
 * ## Tests
 * 
 * Specification function gets the Assert object as an argument.
 */
export type SpecFunc = (assert: Assert) => any
export class Test {
    /**
     * Construct a test from description and specificatin function.
     */
    constructor(
        readonly description: string,
        readonly spec: SpecFunc) { }
     
}
/**
 * Global list of tests. On the browser they are run after the browser is idle.
 */
let tests: Test[] = []
if (typeof window === 'undefined')
    setTimeout(runTests, 0)
/**
 * The performance object.
 */
let performance = typeof window != 'undefined' ?
    window.performance : undefined
/**
 * Run all recorded tests.
 */
async function runTests() {
    let assert = new Assert()
    let test: Test | undefined
    let duration: number
    for (let i = 0; i < tests.length; ++i)
        try {
            duration = 0
            let start = performance?.now() || 0
            test = tests[i]
            test.spec(assert)
            let end = performance?.now() || 0
            duration = end - start
            let message = `Test "${test?.description}" PASSED\n`
            reporter?.({
                test: test!,
                message,
                passed: true,
                duration
            })
        }
        catch(e) {
            let message = `Test "${test?.description}" FAILED\n`
            if (e instanceof Error)
                message += `${e.name} exception thrown: ${e.message}\n${e.stack}`
            reporter?.({
                test: test!,
                message,
                passed: false,
                error: e instanceof Error ? e : undefined
            })
        }
}
/**
 * Create a test.
 */
export function test(description: string, spec: SpecFunc): void {
    tests.push(new Test(description, spec))
}