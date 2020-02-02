import * as zora from 'zora'

export interface Test {
    name: string
    pass: boolean
    error?: string
}

export interface TestStatus {
    passes: number
    fails: number
    tests: Test[]
    done: boolean
}

export function createReporter(render: (status: TestStatus) => void):
    (stream: zora.TestHarness) => Promise<void> {
    let status: TestStatus = {
        passes: 0,
        fails: 0,
        tests: [],
        done: false
    }
    return async (stream: zora.TestHarness): Promise<void> => {
        for await (let message of stream) {
            switch (message.type) {
                case zora.MessageType.TEST_START:
                    render(status)
                    break
                case zora.MessageType.TEST_END:
                    render(status)
                    break
                case zora.MessageType.ASSERTION:
                    let test = message.data as zora.Test
                    status.tests.push({
                        name: test.description,
                        pass: test.pass,
                        error: test.pass ? undefined:
                            test.error.toString()
                    })
                    if (test.pass) 
                        status.passes++
                    else
                        status.fails++
                    render(status)
                    break
            }
        }
        status.done = true
        render(status)
    }
}