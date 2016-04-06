# Docker and Wordpress
## *A personal journey*

You need to use docker compose. That's for local dev. And you want to dorward your ports. To run docker locally you have to type a bunch of commands and you need to remember them. It's helpful to keep your commands in a central place. We'll be using a packages.json file to keep things in order. This might seem wierd but it's good practice in the node community to keep those commands there so you can easily run them with `npm run`.

Docker already has an official guide for [Wordpress](https://docs.docker.com/compose/wordpress/) and this will borrow from that tutorial. There is also a really great tutorial for getting docker working smoothly on [OS X](http://blog.csainty.com/2015/10/docker-on-osx.html). I also found it necessary to use `[docker-pf](https://github.com/noseglid/docker-pf)` for forwarding docker ports to local host.

http://blog.next-revision.com/laravel-on-docker/

```
npm init
```

## Tracking common commands

Follow the instructions, it doesn't really matter what you put until you feel like publishing to NPM, which we won't be doing.

In the package.json file under `scripts` there sould already be a test command. You can add others. You could run test using `npm run test`. Let's add one called `docker:environment` and run it using `npm run docker:environment`

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "docker:environment": "eval \"$(docker-machine env default)\""
  },
```

This command must be run to ensure that dockers environment variables have been set. In practice you must run this everytime you open a new shell unless you add this to your bash script. That is a huge pain (and I need to research how to do that correctly, or if it's recommended).

```
npm run docker:environment
```

## Making localhost work
