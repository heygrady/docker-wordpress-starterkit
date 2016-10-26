This document is an outline for how to deploy and manage a Docker application on a cloud service. This will be written generally with specific examples added for a Wordpress project hosted in the Google Cloud using Google Container engine, known as GKE.

This document should serve as a cheatsheet for creating and deploying projects.

# Source
Our application consists of code that needs deployed on servers. Most people use Git to manage their source code. This document covers source code management from the perspective of deploying the code to a server. It also outlines a good practice for structuring your source code repositories with safe deployment practices in mind.

## Code stored in Git
The source code for your project should have its own git repository. It is customary to break it into a distinct repository for your frontend and backend applications. If you are working on a project that merges the frontend and backend, like on a Wordpress project, you should name it after the application.

It's important to break your project into application specific repositories to aid in consistent and safe deployments. A good rule of thumb is that each repository should be an application. One of the reasons that applications like Wordpress are criticized by experienced developers is the way the frontend template system is so heavily tied to the backend. The ability to version your frontend code separately from your backend code is valuable. When your code base matures and you have good test coverage, separate code bases make it easier to deploy code updates independently.

- `my-company/my-project-frontend`
- `my-company/my-project-backend`
- `my-company/my-project-microservice`
- `my-company/my-project-wordpress`

## Deployment configs stored in Git
Your deployment configs should have a separate git repository from your source code. In truth, it doesn't matter where you store them, but it's highly recommended to store them in git. And storing them separate from your source code has some advantages. One key advantage is that your deployments will typically contain Docker images for both your frontend and backend services. In a larger deployment, you might have a repository for each of your microservices. Your deployment configs should be considered a distinct part of the project.

- `my-company/my-project-deployment`

## Docker images stored in Google Cloud
When you are working with docker you will commonly want to deploy custom dockerfiles. This requires that you publish your images to a docker repository. Luckily that's as easy as publishing an NPM package. Of course, you probably would prefer your Dockerfiles be private and that is available at all of the popular Docker repositories, like Docker hub.

For this project we're going to be using Google Container Engine and they make a private Docker repository available by default. Here's a good tutorial on [creating custom Docker images](http://kubernetes.io/docs/getting-started-guides/meanstack/) and using them with Google Cloud.

1. Create a project on Google Cloud Services using [`gcloud alpha projects create`](https://cloud.google.com/sdk/gcloud/reference/alpha/projects/create)
2. You can now push Docker builds to your [Google Cloud Container Registry](https://cloud.google.com/container-registry/docs/pushing)
3. Add your custom docker images to your containers

```bash
# NOTE: this is overly simplified

# You can create a new project from the command line
gcloud alpha projects create my-project-name

# You need to create a docker tag
docker tag some-folder/example-image gcr.io/my-project-name/example-image

# Then you can push the image up to your gcloud container registry
gcloud docker push gcr.io/my-project-name/example-image
```

# Local dev
Your development environment runs on your local machine, we'll use Docker for this. You should already have [Docker for Mac](https://docs.docker.com/docker-for-mac/) installed on your laptop. We'll be using the same images for development and production. For local development, we'll be using [`docker-compose`](https://docs.docker.com/compose/). For production we'll use Kubernetes on Google Cloud. This allows us to use the same Docker containers, which is a big plus for development -- consistency FTW. The downside is that the configuration between development and production will be slightly different. The config files for managing your production in Google Cloud will be different than the `docker-compoase.yml` used in development.

## Local dev with `docker-compose.yml`
The `docker-compose.yml` should live in the root of each repository. The development setup should be considered part of the project itself. This means that the repository for your frontend, or backend, or microservice should contain a `docker-compose.yml` alongside other top-level project files, such as `package.json` and `.gitignore`.

**Typical project**
```md
- lib/ <-- project code here
- test/
- config/docker/ <-- Dockerfile here
- docker-compose.yml <-- configuration for local dev
- .gitignore
- package.json <-- convenience commands go here
```

## Managing local environment
As a developer on the project you should be able to run a few simple `npm run` commands to manage your local server. It is customary to capture common commands required for your project in your `package.json`. Even if your project is not built on Node, using `npm run` is the easiest way to make sure that the commands a developer needs to run your project are documented.

**READ:** The classic argument for [using NPM as a build tool](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/).

### Creating your `docker-compose.yml`
This is outside the scope of this document (for now). You might enjoy reading the (outdated) [Project History](./project-history.md) for details on getting started with Docker.

### Starting Docker
As a developer, the most common activity is to launch your Docker environment. With a `docker-compose.yml` file that's as simple as calling `docker-compose up`. As a convenience, this should be made available in your `package.json` as `npm run docker:up`. This allows for additional commands to be run prior to starting the containers.

**NOTE:** It is recommended to use [Atom Editor](https://atom.io/) and the [Terminal Plus plugin](https://atom.io/packages/terminal-plus).

- **Foreground:** This will start your Docker environment in the foreground, meaning your servers will shut down if you exit the commandline. This is the preferred method because it makes it easier to spot error messages. The downside is that you will need to open multiple terminal windows to keep working.

  ```bash
  # run docker in the foreground
  npm run docker:up
  ```
- **Background:** Some developers prefer to run their containers in the background. The upside to this approach is that docker isn't tied to a terminal session and will keep running in the background until you stop it. The downside is that you won't see errors and you might forget to stop docker when you're not using it.

  ```bash
  # run docker in the background (daemon mode)
  npm run docker:up:daemon

  # or the hard way :)
  npm run docker:up -- -d
  ```

### Stopping Docker
If you are running Docker in daemon mode (in the background) you will eventually want to stop docker. This is as easy as using `docker-compose down`. As a convenience, this should be made available in your `package.json` as `npm run docker:down`. This allows for additional commands to be run prior to stopping the containers.

- **Foreground:** If docker is running in the foreground, use `ctrl+c` to kill it.
- **Background:** If you started Docker with you `npm run docker:up:daemon` you can bring it down with `npm run docker:down`.
  ```bash
  # stop docker
  npm run docker:down
  ```

### Editing `docker-compose.yml`
If you make changes to your `docker-compoase.yml` file  &mdash; or any of the other files used by your docker images &mdash; you won't see your changes until you rebuild your docker images. This is a common pitfall when you're starting out with `docker-compose`. Simply stopping and starting docker won't pick up your changes.

Docker likes to aggressively cache things (which is why Docker is so fast) so simply killing Docker and re-launching it isn't enough &mdash; you need to rebuild your image. You can accomplish this by running `npm run docker:build && npm run docker:up`. Rebuilding your images before starting Docker in this way will ensure that your latest changes are visible.

**TODO:** It would be nice if the script watched for changes to your `docker-compose.yml` and automatically rebuilt and started your docker services.

```bash
# run docker:build and then docker:up
npm run docker:dev

# run docker:dev in the background (daemon mode)
npm run docker:dev -- -d
```

# Cloud Deployment
For this project we will be using Google Container Engine, which is built around Kubernetes. You need to know that the acronym for Google Container Engine is GKE, where the "K" is for "Kubernetes". Google has a different product, Google *Compute* Engine that is referenced by GCE. Google's cloud offering can be a little confusing at first &mdash; everything is branded with a wacky name that is nearly ungoogleable for a beginner.

We'll be using features from both GKE and GCE but the Docker part of the Google Cloud is managed by Kubernetes. It can get a little confusing because Google let's you mix and match most of their cloud services together. There are strengths to each of them, but we're interested in GKE for managing our Docker deployments.

Other Google services, like Google App Engine (GAE), suffer from [vendor lock-in](http://forecastcloudy.net/2016/01/29/3-ways-to-avoid-google-appengine-lock-in/). We'll be selectively using services from Google where they make sense. For instance, it makes sense to use [`gcloud compute disks`](https://cloud.google.com/sdk/gcloud/reference/compute/disks/) for managing persistent disks used in our containers. It may also make sense to [utilize Google's CloudSQL](http://code.haleby.se/2015/12/04/restrict-google-cloudsql-to-a-kubernetes-cluster/) rather than running your own MySQL containers.

[Kubernetes](http://kubernetes.io/) is open sourced and gaining popularity outside of Google's Cloud platform. You may see some references to Kubernetes that don't mention Google at all. This can also be confusing for beginners. It's worth noting that Kubernetes is sometimes written as as the [numeronym](https://en.wikipedia.org/wiki/Numeronym) "k8s" in the same style as [i18n and l10n](https://en.wikipedia.org/wiki/Internationalization_and_localization#Naming).

## Setting up cloud environment
You will need to use the Google Cloud Dashboard online for some account management, but you primarily work with Google Cloud and Kubernetes form the command line. Because Google decided to open source Kubernetes, things can get a little confusing when you're first starting out.

You manage your Google Cloud environment with the `gcloud` command-line tool and you manage your Kubernetes containers with the `kubectl` command-line tool. You'll need to use both, and you'll find that `kubectl` is dependent on your local `gcloud` configuration.

You can install `gcloud` using the [interactive installer](https://cloud.google.com/sdk/downloads#interactive). You need `gcloud` to interact with the Google Container Engine from the command line.

You should [install `kubectl` as a `gcloud` plugin](http://stackoverflow.com/a/33542894/5149458) using `gcloud components update kubectl`

```bash
# install gcloud
# NOTE: it will ask you questions
curl https://sdk.cloud.google.com | bash

# restart your shell
exec -l $SHELL

# initialize gcloud
gcloud init

#install kubectl
gcloud components update kubectl
```

## Cloud deployments with GKE
You should read through the [GKE quickstart guide](https://cloud.google.com/container-engine/docs/quickstart).

**IMPORTANT:** In order to run containers you need the following
1. A Google Cloud account
2. The `gcloud` and `kubectl` CLI installed and configured
3. A [container cluster](https://cloud.google.com/sdk/gcloud/reference/container/clusters/create)

### Create your container cluster
You need to create your [container cluster](https://cloud.google.com/container-engine/docs/clusters/) before you can deploy containers to it. **A container cluster must exist**, otherwise `kubectl` will throw cryptic errors. If you are seeing issues where none of the `kubectl` commands work, you probably don't have a container cluster. It's also possible that your local `gcloud` isn't configured to use your existing cluster.

The confusing bit is that `kubectl` will automatically use the `gcloud` configuration &mdash; but instead of using project-specific config files, the `gcloud` settings are managed through the command line and affect the whole system. This makes switching between multiple projects less convenient and can lead to cases where your settings are not correct, which will lead to cryptic errors.

**READ:** You should read up on [creating container clusters](https://cloud.google.com/container-engine/docs/clusters/operations)

```bash
# check your gcloud configuration
gcloud config list

# create a cluster if you don't already have one
gcloud container clusters create my-project-cluster
```

### Create your deployment config
This is the fun bit! In GKE, a Deployment is roughly equivalent to your `docker-compose.yml`. It is customary to create your deployment as one or more YAML files, following the Kubernetes YAML format. You can read up on [Kubernetes config best practices](http://kubernetes.io/docs/user-guide/config-best-practices/). The Kubernetes documentation is difficult to navigate. Kubernetes is growing quickly and some conflicting documentation exists.

The current best practice for managing your [Kubernetes Pods](http://kubernetes.io/docs/user-guide/pods/) is with a [Kubernetes Deployment](http://kubernetes.io/docs/user-guide/deployments/). A Pod and a Deployment are basically the same thing &mdash; both can be used to define the Docker containers to deploy to GKE and how they relate to eachother. The key difference is that a Deployment will monitor Pods and ensure that they stay running. Additionally, a Deployment makes it easy to rollout changes to your images.

The main point of a deployment is declare things how many servers to run, what to do when they fail and to manage upgrading the images in place without interrupting your services.

Your deployment configs should be stored in your deployment repository.

```md
- src/ <-- your other repositories (frontend, backend) will be placed here
  - frontend/ <-- this is just a git clone
    - config/Dockerfile
  - backend/
- config/
  - frontend/
    - deployment.yml
  - backend/
    - deployment.yml
- .gitignore <-- be sure to add src/ here
- package.json <-- commands for building and deploying
```

## Managing cloud environment
### Rollout new Docker image
### Rollout new pods
## Bring down cloud environment

# Deploying Code
## Deploying to stage environment
### Stand up stage environment
### Tag release candidate image
### Apply new image to environment
## Deploying to prod
### Tag prod image
### Apply new image to environment
