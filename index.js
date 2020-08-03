class Command {
  constructor (name, operator, callback) {
    this.name = name
    this.operator = operator
    this.callback = callback
  }

  get withArgsMatcher () {
    return /^\/([\w]+)([+|-]+) \b *(.*)?$/m
  }

  get withoutArgsMatcher () {
    return /^\/([\w]+)([+|-])*(.*)?$/m
  }

  listener (context) {
    const { comment, issue, pull_request: pr } = context.payload

    const command = (comment || issue || pr).body.match(this.withArgsMatcher) || (comment || issue || pr).body.match(this.withoutArgsMatcher)

    if (command && this.name === command[1] && this.operator === command[2]) {
      return this.callback(context, { name: command[1], operator: command[2], arguments: command[3] })
    }
  }
}

/**
 * Probot extension to abstract pattern for receiving slash commands with operator in comments.
 *
 * @example
 *
 * // Type `/label+ foo, bar` in a comment box to add labels
 * commands(robot, 'label', '+' (context, command) => {
 *   const labels = command.arguments.split(/, *\/);
 *   context.github.issues.addLabels(context.issue({labels}));
 * });
 */
module.exports = (robot, name, operator, callback) => {
  const command = new Command(name, operator, callback)
  const events = ['issue_comment.created', 'issues.opened', 'pull_request.opened']
  robot.on(events, command.listener.bind(command))
}

module.exports.Command = Command
