module.exports = {
  types: [
    { type: 'feat', emoji: '✨', description: 'A new feature' },
    { type: 'fix', emoji: '🐛', description: 'A bug fix' },
    { type: 'docs', emoji: '📚', description: 'Documentation only changes' },
    { type: 'style', emoji: '💎', description: 'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)' },
    { type: 'refactor', emoji: '📦', description: 'A code change that neither fixes a bug nor adds a feature' },
    { type: 'perf', emoji: '🚀', description: 'A code change that improves performance' },
    { type: 'test', emoji: '🚨', description: 'Adding missing tests or correcting existing tests' },
    { type: 'build', emoji: '🛠', description: 'Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)' },
    { type: 'ci', emoji: '⚙️', description: 'Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)' },
    { type: 'chore', emoji: '♻️', description: 'Other changes that don\'t modify src or test files' },
    { type: 'revert', emoji: '🗑', description: 'Reverts a previous commit' },
  ],
};
