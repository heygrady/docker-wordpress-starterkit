# Deployment on GKE
This is an example deployment repo as described in [this document](../../docs/deployment-on-gke.md). The code here is what you'd expect to see in the deployment repository for a wordpress project.

#### Repos
- `my-company/my-project-wordpress`
- `my-company/my-project-deployment`

## Typical project layout

```md
- config/deployment/
  - wordpress.yml <-- kubernetes config
- scripts/ <-- deployment helper scripts, if necessary
- source/ <-- contains a clone of the wordpress repo
- .gitignore
- package.json <-- should contain a `deploy` command
- readme.md <-- this file
```

# Deploy scripts

**NOTE:** this is fictional right now.

**TODO:** how to specify which app to build. Each app has branches and tags. You might want to specify branches when deploying a specific app. Each image is also versioned. This could get confusing. Deploying the whole cluster is easy enough to do. But if your cluster is complex (like a full nginx, redis, wordpress-api, with react-redux-universal) you will want to version each container image separately.

- `npm run clone` clones the repos for the application code for building the images.
- `npm run build` clones source and builds all containers.
- `npm run push` pushes all images to Container Registry
- `npm run build:push` builds and pushes
- `npm run tag -- version=x.x.x` build/push with a tagged version number of `x.x.x`. Also marks a tagged release in Github
- `npm run deploy` prepares a staging deploy using `master`
- `npm run deploy:prod -- version=x.x.x` prepares a prod deploy, tagged with the version number. Can optionally specify branch. Production deploys require a version number.
- `npm run rollback -- version=x.x.x` rolls back to a previously deployed image

## Clone
Clones all of the repos available in `comfy.json`

```bash
# using npm run
npm run clone

# --force
npm run clone -- --force

# --repo
npm run clone -- --repo=frontend,wordpress

# using scripts
node ./scipts/comfy.js clone

# --force
node ./scipts/comfy.js clone --force
```

```json
{
  "repos": {
    "wordpress_test": {
      "url": "https://github.com/heygrady/docker-wordpress-starterkit.git",
      "version": "",
      "branch": "",
      "containers": ["wordpress"]
    },
    "frontend_test": "https://github.com/heygrraady/docker-wordpress-starterkit.git"
  }
}
```

## Build

```js
exec(`docker build -f source/${repo}/containers/${container} -t gcr.io/${project}/${repo}-${container}:${containerTag} source/${repo}`)
```
