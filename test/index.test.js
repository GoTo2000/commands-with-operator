const { createRobot } = require('probot')
const commands = require('..')

describe('commands', () => {
  let callback
  let robot

  beforeEach(() => {
    callback = jest.fn()
    robot = createRobot({ app: jest.fn().mockReturnValue('test') })
    commands(robot, 'foo', '+', callback)
  })

  it('invokes callback and passes command logic', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo+ bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', operator: '+', arguments: 'bar', 'preComment': null })
  })

  it('invokes the command without arguments', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/foo+' }
      }
    })

    expect(callback).toHaveBeenCalled()
  })

  it('invokes the command with comment', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'test\n\n |> /foo+ bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', operator: '+', arguments: 'bar', preComment: 'test' })
  })

  it('invokes the command with comment and without space', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'test\n\n|>/foo+ bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', operator: '+', arguments: 'bar', preComment: 'test' })
  })

  it('does not call callback for other commands', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: 'hello world\n\n/nope nothing to see' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for superstring matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '/foobar+' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('does not call callback for substring matches', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'created',
        comment: { body: '/fo+' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issue edit', async () => {
    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'updated',
        comment: { body: '/foo+ bar' }
      }
    })

    await robot.receive({
      event: 'issue_comment',
      payload: {
        action: 'deleted',
        comment: { body: '/foo+ bar' }
      }
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('invokes command on issues.opened', async () => {
    await robot.receive({
      event: 'issues',
      payload: {
        action: 'opened',
        issue: { body: '/foo+ bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', operator: '+', arguments: 'bar', preComment: null })
  })

  it('invokes command on pull_request.opened', async () => {
    await robot.receive({
      event: 'pull_request',
      payload: {
        action: 'opened',
        issue: { body: '/foo+ bar' }
      }
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls[0][1]).toEqual({ name: 'foo', operator: '+', arguments: 'bar', preComment: null })
  })
})
