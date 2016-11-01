const exec = require('child-process-promise').exec
const Promise = require('bluebird')
const fs = require('fs-extra-promise')

const config = require('../../comfy.json')
const { project } = config

const build = (cmd) => {
  const { repos:urls } = config
  const repos = cmd.repo ? cmd.repo.split(',') : Object.keys(urls)

  // repo
  // container
  // project
  // containerTag

  // make an array of promise funcs
  // @see https://bramanti.me/are-you-serial-promise-all/
  const funcs = []

  repos.forEach(repo => {
    // a func that returns a promise
    funcs.push(() => {
      console.log(`--- ${repo}`)

      // check if directory exists
      return fs.readdirAsync(`./source/${repo}`).catch(err => {
        console.log(err.toString())
      })

      // check for containers in the repo
      .then((files) => {
        const exists = !!files && !!files.length
        if (!exists) { throw `Error: Repo ${repo} not found in source/${repo}` }
        return fs.readdirAsync(`./source/${repo}/containers`)
      })

      // loop the available containers
      .then((containers) => {
        const exists = !!containers && !!containers.length
        if (!exists) { throw `Error: Repo ${repo} does not have any containers` }

        // return an array of exec promises. This will build the containers in parallel
        // TODO: this should run in sequence, not parallel
        return containers.map((container) => {
          // TODO: need to control the tag per container
          // TODO: is it possible to auto-track tags per container based on deployments to prod? Maybe. Would also need to check git commits.
          // NOTE: perhaps --tag=repo-container:tag,repo2-container:tag2
          const tag = 'v0'

          console.log(`Building gcr.io/${project}/${repo}-${container}:${tag}`)
          return exec(`docker build -f ./source/${repo}/containers/${container}/Dockerfile -t gcr.io/${project}/${repo}-${container}:${tag} ./source/${repo}`)
            .then(
              (result) => { console.log(`Successfully built gcr.io/${project}/${repo}-${container}:${tag}`) },
              (err) => { console.log(err.toString()) }
            )
            .childProcess.stdout.on('data', function (data) {
              console.log(data.toString().replace(/^\s+|\s+$/g, ''))
            })
        })
      }, (err) => {
        console.log(err.toString())
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
}

module.exports = (program) => {
  program.command('build')
    .description('Builds Docker containers from source repositories')
    .option('-r, --repo [repo]', 'Repo(s) to build, default builds all. ex: --repo=wordpress,frontend')
    .option('-c, --container [container]', 'Container(s) to build, default builds all. ex: --container=wordpress,frontend')
    .option('-t, --tag [tag]', 'Specify the tag for the container being built (how will this work?)')
    .option('--clone', 'Attempts to clone first (not implemented)')
    .action(build)
}
