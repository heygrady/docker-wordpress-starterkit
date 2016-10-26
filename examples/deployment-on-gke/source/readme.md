The `source` folder contains various github repositories. Each repo is expected to have a `containers` folder with a folder for each Dockerfile the application requires.

It is expected that your main app Dockerfile `COPY` the current build into the image. This makes it easy for the code to be deployed, because it is always bundled with its container. For local development, having the code baked into the image is annoying. However, it's possible to override the code in the image using [`volumes`](https://docs.docker.com/compose/compose-file/#/volumes-volumedriver). For a PHP project, you could just mount the source code directly in the image. For a node app, like a React/Redux universal app, you need to mount the `dist` folder.

You can also override the [`command`](https://docs.docker.com/compose/compose-file/#/command) if necessary. For a any PHP project using Apache you wouldn't normally need to restart your service during dev. But if you have a node app, like a React/Redux universal app, you will want to use `node` to launch your service in production and `nodemon` to run your service during local dev.

##### Using volumes in a `docker-compose.yml`
```yml
version: '2'
services:
  # ...
  wordpress:
    depends_on:
      - db
    build:
      context: ./containers/wordpress/
      dockerfile: Dockerfile
    links:
      - db
    ports:
      - "8080:80"
    restart: always
    volumes:
      # You can mount a local folder over a folder within the image
      # npm run dev should create a new build after every change
      - "./dist/www:/var/www/:rw"
```

## Production deployment
The configurations for deploying this container in production are stored in the deployment repository. This consists of the files for creating cluster of containers in the cloud. The deployment scripts will be charged with building the docker images for the application and pushing them to the private Docker registry and rolling the servers to get the image deployed.

## Typical project layout

```md
- containers/ <-- docker containers
  - wordpress/ <-- used for dev and prod
    - Dockerfile <-- building the docker image *is* the build tool
                     copies code from `build/` into the image
    - entrypoint.sh
- dist/ <-- the current build of the code goes here
- lib/ <-- your project code, gets embedded in the docker image
- test/
- docker-compose.yml <-- only used for dev
                         overrides some Dockerfile settings
                         to allow for live editing
                         and customize for local dev
- .gitignore
- package.json <-- should have `build`, `dev` and `test` commands
- readme.md
```
