#!/usr/bin/env node

const program = require('commander')

program
  .version('0.0.1')
  // .option('-C, --chdir <path>', 'change the working directory')
  // .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
  // .option('-T, --no-tests', 'ignore test hook')

// program.command('setup [env]')
//   .description('run setup commands for all envs')
//   .option('-s, --setup_mode [mode]', 'Which setup mode to use')
//   .action((env, options) => {
//
//   })

require('./commands/clone')(program)
require('./commands/build')(program)
require('./commands/push')(program)
require('./commands/deploy')(program)

program.command('tag')
  .description('This is for creating tags in your source repo when deplyoing to production. Production deployments require the current branch to be a Git tag.')
  .option('-r, --repo [repos...]', 'Repo(s) to tag')
  .option('-v, --version [version]', 'version of your tag')
  .action((repos) => {
    console.log('clone', repos)
  })

// program.command('deploy')
//   .description('Clones all repos to the source folder')
//   .option('-r, --repo [repos...]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
//   .action((repos) => {
//     console.log('clone', repos)
//   })

program.command('rollback')
  .description('Clones all repos to the source folder')
  .option('-r, --repo [repos...]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
  .action((repos) => {
    console.log('clone', repos)
  })

program.parse(process.argv)
