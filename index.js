class Command {
  constructor (name, operator, callback) {
    this.name = name
    this.operator = operator
    this.callback = callback
  }

  get matcher () {
    return /^\/([\w]+)([+|-]) *(.*)?$/m
  }

  get commentIdentifier () {
    return '|>'
  }

  listener (context) {
    const { comment, issue, pull_request: pr } = context.payload
    const commentAndCommandContent = (comment || issue || pr).body.split(this.commentIdentifier)

    if (!commentAndCommandContent || commentAndCommandContent.length === 0 || commentAndCommandContent.length > 2) {
      return
    }

    if (commentAndCommandContent.length === 2) {
      const preComment = commentAndCommandContent[0].trim()
      const commandContent = commentAndCommandContent[1].trim()
      const commandDetail = commandContent.match(this.matcher)
      if (commandDetail && this.name === commandDetail[1].toLocaleLowerCase() && this.operator === commandDetail[2]) {
        return this.callback(context, this.constructCommandDetailWithComment(preComment, commandDetail))
      }
    }

    const commandContent = commentAndCommandContent[0]
    const commandDetail = commandContent.match(this.matcher)
    if (commandDetail && this.name === commandDetail[1] && this.operator === commandDetail[2]) {
      return this.callback(context, this.constructCommandDetailWithComment(null, commandDetail))
    }
  }

  constructCommandDetailWithComment (preComment, commandDetail) {
    return {
      name: this.name,
      operator: this.operator,
      arguments: commandDetail[3],
      preComment
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
