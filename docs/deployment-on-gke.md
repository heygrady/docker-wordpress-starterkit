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
# this is overly simplified
gcloud alpha projects create my-project-name
docker tag some-folder/example-image gcr.io/my-project-name/example-image
gcloud docker push gcr.io/my-project-name/example-image
```

# Local dev
Your development environment runs on your local machine. You should already have [Docker for Mac](https://docs.docker.com/docker-for-mac/) installed on your laptop.

## Local dev with `docker-compose.yml`
The docker-compose.yml should live in the root of each repository.

```md
- lib/ (project code here)
- test/
- config/docker/ (dockerfiles here)
- docker-compose.yml
- package.json
```

## Managing local environment
As a developer on the project you should be able to run a few simple `npm run` commands to manage your local server.

### Starting Docker

```bash
npm run docker:start
```
#### Foreground

```bash
npm run docker:start
```

#### Background

```bash
npm run docker:start:bg
```

### Stopping Docker

```bash
npm run docker:stop
```

#### Foreground
Use `ctrl+c`

#### Background

```bash
npm run docker:stop
```

### Editing `docker-compose.yml`

```bash
npm run docker:dev
```


# Cloud Deployment

## Setting up cloud environment
You can install `gcloud` using the [interactive installer](https://cloud.google.com/sdk/downloads#interactive). You need `gcloud` to interact with the Google Container Enginer from the command line.

### Cloud deployments with GKE
#### Create cluster
#### Create deployment

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
