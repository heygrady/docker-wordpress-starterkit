const exec = require('child-process-promise').exec
const Promise = require('bluebird')
const fs = require('fs-extra-promise')

const config = require('../../comfy.json')
const { project, repos } = config

const deploy = (cmd) => {
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
      .then((files) => {
        return files && files.length
      })

      // deploy!
      .then(shouldDeploy => {
        if (shouldDeploy) { console.log(`Deploying ${repo}`) }
        else { console.log(`Skipping ${repo}, no files found`) }

        return shouldDeploy && exec(`kubectl apply -f config/${repo}`).then(() => {
          console.log(`Successfully deployed ${repo}\n`)
        }).catch(err => {
          console.log(err.stderr)
          console.log(`Error: Failed to deploy ${repo}`)
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
  program.command('deploy')
    .description('Clones all repos to the source folder')
    .option('-r, --repo <repos>', 'Repo(s) to deploy', list, defaultRepos)
    .option('-c, --container <containers>', '(not implemented) Container(s) to deploy', list)
    .action(deploy)
}
