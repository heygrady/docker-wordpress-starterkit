const exec = require('child-process-promise').exec
const Promise = require('bluebird')
const fs = require('fs-extra-promise')

const config = require('../../comfy.json')
const { project, repos } = config

const deleteDeployment = (cmd) => {
  const { repo:repos, container:containers } = cmd

  // make an array of promise funcs
  // @see https://bramanti.me/are-you-serial-promise-all/
  const funcs = []

  repos.forEach(repo => {
    // a func that returns a promise
    funcs.push(() => {
      console.log(`--- ${repo}`)

      // check if directory exists
      return fs.readdirAsync(`./config/${repo}`).catch(err => {
        // console.log(err)
      })

      // ensure there are deployment files here
      .then(files => files && files.length)

      // delete!
      .then(shouldDeploy => {
        if (shouldDeploy) { console.log(`Deleting ${repo}`) }
        else { console.log(`Skipping ${repo}, no files found`) }

        return shouldDeploy && exec(`kubectl delete -f config/${repo}`).then(() => {
          console.log(`Successfully deleted ${repo}\n`)
        }).catch(err => {
          console.log(err.stderr)
          console.log(`Error: Failed to delete ${repo}`)
        }).childProcess.stdout.on('data', function (data) {
          console.log(data.toString().replace(/^\s+|\s+$/g, ''))
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
}

const list = val => val.split(',')
const defaultRepos = Object.keys(repos)

module.exports = (program) => {
  program.command('delete')
    .description('Deletes deployments from the GKE cluster')
    .option('-r, --repo <repos>', 'Repo(s) to delete', list, defaultRepos)
    .option('-c, --container <containers>', '(not implemented) Container(s) to delete', list)
    .action(deleteDeployment)
}
