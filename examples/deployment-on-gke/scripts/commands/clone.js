const exec = require('child-process-promise').exec
const Promise = require('bluebird')
const fs = require('fs-extra-promise')

const config = require('../../comfy.json')

const clone = (cmd) => {
  const { repos:urls } = config
  const repos = cmd.repo ? cmd.repo.split(',') : Object.keys(urls)
  const { force } = cmd

  // make an array of promise funcs
  // @see https://bramanti.me/are-you-serial-promise-all/
  const funcs = []

  repos.forEach(repo => {
    const url = urls[repo] && urls[repo].url ? urls[repo].url : urls[repo]

    if (!url) {
      console.log(`Error: No url found for ${repo}. Check comfy.json for an entry in "repos".\n`)
      return
    }

    // a func that returns a promise
    funcs.push(() => {
      console.log(`--- ${repo}`)
      // check if directory exists
      return fs.readdirAsync(`./source/${repo}`).catch(err => {
        // console.log(err)
      })

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
          console.log(`Error: Could not clone ${url} into existing directory source/${repo}.\n\tUse --force to remove existing directory before cloning`)
          return false
        }
        return true
      })

      // clone repo into directory
      .then(shouldClone => {
        if (shouldClone) { console.log(`Cloning ${url}`) }
        else { console.log(`Skipping ${url}`) }

        return shouldClone && exec(`git clone ${url} source/${repo}`).then(() => {
          console.log(`Successfully cloned ${url} into source/${repo}\n`)
        }).catch(err => {
          console.log(err.stderr)
          console.log(`Error: Failed to clone ${url}`)
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

//
module.exports = (program) => {
  program.command('clone')
    .description('Clones all repos to the source folder')
    .option('-r, --repo [repo]', 'Repo(s) to clone, default clones all. ex: --repo=wordpress,frontend')
    .option('-b, --branch [branch]', 'Branch to select (not implemented)')
    .option('-f, --force', 'remove the existing repo before cloning')
    .action(clone)
}
