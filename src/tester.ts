/**
 * # Assertions and Tests
 * 
 * Basic building blocks of a test suite.
 * 
 * ## Assertions
 * 
 * Different comparisons to assert that test has succeeded. The result of an
 * assertion is saved in the Assertion object.
 */
export interface Assertion {
    message: string
    passed: boolean
}
/**
 * The Assert class provides methods for checking equalities and conditions.
 * It tracks results of those checks in Assertion objects.
 */
export class Assert {
    readonly assertions: Assertion[] = []

    private record(message: string, pass: boolean) {
        this.assertions.push({ message, passed: pass })
    }
    private deepEqual(a: any, b: any): boolean {
        if (a === b) 
            return true
        if (a == null || b == null) 
            return a === b
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) 
                return false
            for (let i = 0; i < a.length; i++) {
                if (!this.deepEqual(a[i], b[i])) 
                    return false
            }
            return true
        }
        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a)
            const keysB = Object.keys(b)
            if (keysA.length !== keysB.length) 
                return false
            for (const key of keysA) {
                if (!keysB.includes(key)) 
                    return false
                if (!this.deepEqual(a[key], b[key])) 
                    return false
            }
            return true
        }
        return false
    }
    equal<T>(message: string, value1: T, value2: T) {
        this.record(message, this.deepEqual(value1, value2))
    }
    notEqual<T>(message: string, value1: T, value2: T) {
        this.record(message, !this.deepEqual(value1, value2))
    }
    same<T>(message: string, value1: T, value2: T) {
        this.record(message, Object.is(value1, value2))
    }
    notSame<T>(message: string, value1: T, value2: T) {
        this.record(message, !Object.is(value1, value2))
    }
    isTrue(message: string, value: boolean) {
        this.record(message, value)
    }
    isFalse(message: string, value: boolean) {
        this.record(message, !value)
    }
    throws<T extends Function>(message: string, 
        func: () => any, error: T) {
        try {
            func()
            this.record(message, false)
        }
        catch (e) {
            this.record(message, e instanceof error)
        }
    }
}
/**
 * ## Results
 * 
 * Test results get returned as an object.
 */
export interface TestResult extends Assertion {
    test: Test
    assertions: Assertion[]
    error?: any
    duration?: number
}
/**
 * ## Tests
 * 
 * Specification function gets the Assert object as an argument.
 */
export type SpecFunc = (assert: Assert) => any
export class Test {
    /**
     * Construct a test from message and specificatin function.
     */
    constructor(
        readonly description: string,
        readonly spec: SpecFunc) { }
}
/**
 * Global list of tests. On the browser they are run after the browser is idle.
 */
let tests: Test[] = []
/**
 * The timer object. This is set from outside the module, if run on node. For
 * browser the `window.performance` object is used.
 */
export interface Timer {
    now(): number
}
let timer: Timer | undefined = typeof window != 'undefined' ?
    window.performance : undefined

export function setTimer(t: Timer) {
    timer = t
}
/**
 * Run all recorded tests.
 */
export async function* runTests(): AsyncIterable<TestResult> {
    let test: Test | undefined
    let duration: number
    for (let i = 0; i < tests.length; ++i)
        try {
            test = tests[i]
            duration = 0
            let start = timer?.now() || 0
            let assert = new Assert()
            await Promise.resolve(test.spec(assert))
            let end = timer?.now() || 0
            duration = Math.round(end - start)
            let passed = assert.assertions.every(a => a.passed)
            let message = `Test "${test!.description}" ${
                passed ? "PASSED" : "FAILED" } in ${duration}ms`
            yield {
                test: test!,
                message,
                passed,
                assertions: assert.assertions,
                duration
            }
        }
        catch(e) {
            let message = `Test "${test?.description}" FAILED\n`
            if (e instanceof Error)
                message += `${e.name} exception thrown: ${e.message}\n${e.stack}`
            yield {
                test: test!,
                message,
                passed: false,
                assertions: [],
                error: e
            }
        }
}
/**
 * Create a test.
 */
export function test(description: string, spec: SpecFunc): void {
    tests.push(new Test(description, spec))
}