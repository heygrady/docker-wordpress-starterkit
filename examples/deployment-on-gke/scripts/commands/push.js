const exec = require('child-process-promise').exec
const Promise = require('bluebird')
const fs = require('fs-extra-promise')

const config = require('../../comfy.json')
const { project } = config

const push = (cmd) => {
  const { repos:urls } = config
  const repos = cmd.repo ? cmd.repo.split(',') : Object.keys(urls)

  // repo
  // container
  // project
  // containerTag
  // gcloud docker push gcr.io/$PROJECT_ID/hello-node:v1
  // `gcloud docker push gcr.io/${project}/${repo}-${container}:${tag}`

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

        // TODO: this should run in sequence, not parallel
        return containers.map((container) => {
          // TODO: need to control the tag per container
          // TODO: is it possible to auto-track tags per container based on deployments to prod? Maybe. Would also need to check git commits.
          // NOTE: perhaps --tag=repo-container:tag,repo2-container:tag2
          const tag = 'v0'

          console.log(`Pushing gcr.io/${project}/${repo}-${container}:${tag}`)
          return exec(`gcloud docker push gcr.io/${project}/${repo}-${container}:${tag}`)
            .then(
              (result) => { console.log(`Successfully pushed gcr.io/${project}/${repo}-${container}:${tag}`) },
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
  program.command('push')
    .description('Pushes built Docker containers to the Google Cloud Container Registry')
    .option('-r, --repo [repo]', 'Repo(s) to push, default pushes all. ex: --repo=wordpress,frontend')
    .option('-c, --container [container]', 'Container(s) to push, default pushes all. ex: --container=wordpress,frontend')
    .option('-t, --tag [tag]', 'Specify the tag for the container being built (how will this work?)')
    .option('-b, --build', 'Attempts to build the container first (not implemented)')
    .action(push)
}
