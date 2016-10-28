#!/usr/bin/env node

const program = require('commander')
const exec = require('child-process-promise').exec
const config = require('../comfy.json')

const Promise = require('bluebird')
const fs = require('fs-extra-promise')

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

program.command('clone')
  .description('Clones all repos to the source folder')
  .option('-r, --repo [repo]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
  .option('-f, --force', 'remove the existing repo before cloning')
  .action((cmd) => {
    const { repos:urls } = config
    const repos = cmd.repo ? cmd.repo.split(',') : Object.keys(urls)
    const { force } = cmd

    // make an array of promise funcs
    // @see https://bramanti.me/are-you-serial-promise-all/
    const funcs = []
    repos.forEach(repo => {
      const url = urls[repo]
      funcs.push(() => {
        // check if directory exists
        return fs.readdirAsync(`./source/${repo}`).catch(err => [])

        // remove directory or fail
        .then((files) => {
          const exists = !!files && !!files.length

          if (exists && force) {
            console.log(`Removing existing directory source/${repo}`)
            return fs.removeAsync(`./source/${repo}`)
              .then(() => {
                console.log(`Successfully removed directory source/${repo}`)
                return true
              })
              .catch(err => {
                console.log(`Error: could not remove source/${repo}\n`)
                console.log(err)
              })
          } else if (exists) {
            console.log(`Error: Could not clone ${url} into existing directory source/${repo}.\n\tUse --force to remove existing directory before cloning\n`)
            return false
          }
          return true
        })

        // clone repo into directory
        .then(shouldClone => {
          console.log(`Cloning ${url}`)
          return shouldClone && exec(`git clone ${url} source/${repo}`).then(() => {
            console.log(`Successfully cloned ${url} into source/${repo}\n`)
          }).catch(err => {
            console.log(`Error: Failed to clone ${url}`)
            console.log(err.stderr)
          })
        })
      })
    })

    // execute promise funcs sequentially
    Promise.reduce(funcs, (values, fn) => {
      return fn().then((result) => {
        values.push(result)
        return values
      })
    }, [])
  })

program.command('build')
  .description('Build all repos to the source folder')
  .option('-r, --repo [repos...]', 'Repo(s) to build, default builds all. ex: --repo=wordpress,frontend')
  .action((repos) => {
    console.log('clone', repos)
  })

program.command('push')
  .description('Clones all repos to the source folder')
  .option('-r, --repo [repos...]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
  .action((repos) => {
    console.log('clone', repos)
  })

program.command('tag')
  .description('Clones all repos to the source folder')
  .option('-r, --repo [repos...]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
  .action((repos) => {
    console.log('clone', repos)
  })

program.command('deploy')
  .description('Clones all repos to the source folder')
  .option('-r, --repo [repos...]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
  .action((repos) => {
    console.log('clone', repos)
  })

program.command('rollback')
  .description('Clones all repos to the source folder')
  .option('-r, --repo [repos...]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
  .action((repos) => {
    console.log('clone', repos)
  })

program.parse(process.argv)
