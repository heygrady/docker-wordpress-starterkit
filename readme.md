# Docker and WordPress/Bedrock

Several approaches already exist for using Docker with WordPress, including a couple of turnkey solutions and an [official Docker container for WordPress](https://hub.docker.com/_/wordpress/), but the thing is, we use [Bedrock](https://roots.io/bedrock/) in development and production, so we needed to take a different path.

The R&D behind this project continues, and you can read all about the long-form journey [here](project-history.md). In a nutshell, this project aims to mate Docker with what we've found to be the best workflow (Bedrock) for making WordPress more like a true [twelve-factor application](http://12factor.net/).


## Assumptions/Requirements

This is written assuming you want to develop WordPress (Bedrock) on a Mac using Docker to manage your local dev environment. 

With that in mind, you'll need:
- [Node/NPM](https://docs.npmjs.com/getting-started/installing-node)
- [Docker/Docker Toolbox](https://www.docker.com/products/docker-toolbox)
- [Sequel Pro](http://www.sequelpro.com/) (Optional, but great if you want a GUI for your local DB)

*N.B!* You will only be able to use the guides herein if you have finished at least [Step 1](https://docs.docker.com/mac/step_one/) of the Docker Toolbox docs. Go ahead, we'll wait.


## How to Proceed

Great, let's get on with it, then!

- [How to set up your local development environment](docs/local-dev-setup.md)
- Deploying via Bedrock-Capistrano
- Deploying via Docker (IN PROGRESS)
- [Why We Use This Instead of VVV](docs/docker-vs-vvv.md)
- [Docker and WordPress: A Personal Journey](docs/project-history.md)


## Too Long? Don't Read?

```
# Start wherever you wanna keep your local dev sites. We like to just name our directory after the domain of the project.
$ git clone https://github.com/heygrady/docker-wordpress-starterkit.git yoursite.com && cd yoursite.com
$ docker-machine start default || true && eval $(docker-machine env default)
# This pulls down a fresh WordPress/Bedrock installation
$ npm run bedrock:init
# Instead, you can pull down an existing Bedrock project you already use with this
$ npm run bedrock:init --docker-wordpress-starterkit:repo=git@gitlab.com:organization/example-name.git
# Start it on up, this will run php composer for you
$ npm run docker:up:daemon 
# Wait patiently for everything to initialize, might take a bit
$ open -a Google\ Chrome http://localhost:8080
# go through the install completely
# To make the DB persist, you need to run this command to shut the server down.
$ npm run docker:down:dump
# This restores the data when brought back up
$ npm run docker:up:daemon
# need a MySQL GUI?
$ npm run docker:db:open
```


## Helpful Commands
You can see these new scripts in the `package.json` in this repository.

| Command                          | Description |
| -------------------------------- | ---         |
| `npm run docker:env`             | Sets the docker environment variables. This doesn't work exactly like you'd expect when you run it through NPM. It doesn't actually set the variables in your shell but in the environment that NPM is executing within. This is most useful when combined with other commands. NOTE: hmmmm. This needs explored.       |
| `npm run bedrock:init` | Downloads a fresh copy of Bedrock WordPress to a local `bedrock` directory. OPTIONAL FLAG --docker-wordpress-starterkit:repo <GIT REMOTE PATH> pulls down existing Bedrock project |
| `npm run docker:pf`              | Starts the docker-pf port forwarding script in background mode. |
| `npm run docker:pf:down`         | Kills the docker-pf port forwarding script. |
| `npm run docker:build`           | Builds or rebuilds the images. Useful when you make changes to your `Dockerfile` or any of the files that are mentioned in your `Dockerfile`, like the `docker-entrypoint.sh`. |
| `npm run docker:up`              | Starts the port forwarding script and starts your servers. |
| `npm run docker:up:daemon`       | Starts your servers as a background daemon. |
| `npm run docker:down`            | Stops the servers and stops the port forwarding script. |
| `npm run docker:down:dump`       | Dumps the DB to your local and then stops the servers. |
| `npm run docker:shell`           | Launches an interactive shell in the docker machine running WordPress. |
| `npm run docker:shell:wordpress` | Launches an interactive shell in the docker machine running WordPress. |
| `npm run docker:shell:db`        | Launches an interactive shell in the docker machine running your DB. |
| `npm run docker:db:dump`         | Zips up any existing dumps and then dumps the current schema and data to your local `data` directory. |
| `npm run docker:db:open`         | Launches Sequel Pro with an open connection to your current WordPress MySQL database. |
| `npm run docker:db:dump:schema`  | Zips up any existing schema dumps and dumps the current schema to your local `data` directory. |
| `npm run docker:db:dump:data`    | Zips up any existing data dumps and dumps the current data to your local `data` directory. |
| `npm run docker:db:roll:schema`  | Zips up any existing schema dumps and labels them with a timestamp in your local `data` directory. |
| `npm run docker:db:roll:data`    | Zips up any existing data dumps and labels them with a timestamp in your local `data` directory. |

