import * as zora from 'zora'

export interface Assertion {
    name: string
    pass?: boolean
}

export interface Test extends Assertion {
    error?: Error
    passes: number
    fails: number
    duration: number
    tests: Test[]
    assertions: Assertion[]
}

function createTest(name: string): Test {
    return {
        name,
        passes: 0,
        fails: 0,
        duration: 0,
        tests: [],
        assertions: []
    }
}

export function createReporter(name: string, render: (rootTest: Test) => void):
    (stream: zora.TestHarness) => Promise<void> {
    let rootTest = createTest(name)
    let teststack: Test[] = [rootTest]
    return async (stream: zora.TestHarness): Promise<void> => {
        for await (let message of stream) {
            switch (message.type) {
                case zora.MessageType.TEST_START:
                    let newtest = createTest((message as zora.StartTestMessage)
                        .data.description)
                    teststack[teststack.length - 1].tests.push(newtest)
                    teststack.push(newtest)
                    render(rootTest)
                    break
                case zora.MessageType.TEST_END:
                    let ztest = message.data as zora.Test
                    let test = teststack.pop()
                    test.pass = ztest.pass
                    test.passes = ztest.successCount
                    test.fails = ztest.failureCount
                    test.error = ztest.error
                    test.duration = ztest.executionTime
                    render(rootTest)
                    break
                case zora.MessageType.ASSERTION:
                    let zass = message.data as zora.AssertionResult
                    teststack[teststack.length - 1].assertions.push({
                        name: zass.description,
                        pass: zass.pass
                    })
                    break
                case zora.MessageType.BAIL_OUT:
                    teststack[teststack.length - 1].error =
                        (message as zora.BailoutMessage).data
                    render(rootTest)
                    break
            }
        }
    }
}