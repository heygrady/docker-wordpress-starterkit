# Docker and Wordpress
### *A personal journey*

Wordpress is easy. Docker is easy. There's a ready-made [official container for Wordpress](https://hub.docker.com/_/wordpress/)... so why isn't this easy to do? In a word: networking.

Getting computers to talk to each other is an age old problem and virtualization hasn't changed that one bit. Running your code in a Docker container is effectively the same thing as running it in any other virtual machine or on another computer altogether. Under the hood on a Mac, Docker just uses VirtualBox. It's not all bad. Docker actually does the hard work of "making networking easy" but networking is still so difficult that you are bound to run into a few snags, particularly for local development.

Using virtual containers for local development can take much of the hassle out of configuring your dev environment and sharing it with your team. The [toolbox for working with Docker](https://www.docker.com/products/docker-toolbox) is getting much better; with [docker-compose](https://docs.docker.com/compose/) and [docker-machine](https://docs.docker.com/machine/) it's getting trivial to manage your dev environment in the same repo where you manage your code (at least for getting started). Docker Hub makes it easy to manage your own repositories of servers and even keep them private.

All good? Not quite.

Docker is still designed primarily to be used by a professional who already knows how to manage servers in the cloud. Docker actually starts making more sense the closer you get to using it in production -- in particular, some of the local development roadblocks start to look like useful features in a cloud environment. There's a lack of documentation because of the newness of the technology and the general audience it serves. Anyone who is used to the extremely kind and coherent documentation that comes from PHP or [MDN](https://developer.mozilla.org/en-US/) or from the WordPress community will already be familiar with how jarring it is to look up documentation about UNIX commands or configuring servers. Docker is *all about* UNIX commands and configuring servers and the documentation isn't always illuminating from a developers perspective. (Apologies in advance if you are a server pro and think the documentation is perfect because it doesn't waste any breath coddling the newbies).

For a developer who wants get up and running with docker there are a number of pitfalls. Digging through the issues is a dizzying experience for someone just trying to get a local development environment set up. 

There's also a few terrible roadblocks.

### A quick note
This is written assuming you want to develop Wordpress on a Mac using Docker to manage your local dev environment. You should have already installed the [Docker toolbox](https://www.docker.com/products/docker-toolbox). There is a really great tutorial for [getting docker working smoothly on OS X](http://blog.csainty.com/2015/10/docker-on-osx.html). But it's probably best to just install the [Docker toolbox](https://www.docker.com/products/docker-toolbox) for Mac. It will [install VirtualBox](https://www.virtualbox.org/wiki/Downloads) for you if you don't already have it. 

Currently Docker has a confusing ecosystem of command line tools. The good news is that they are rapidly working to upgrade everything to a more idiot-proof work flow. The bad news is they aren't there yet. In the meantime we're stuck with a few different commands and tools required to get things going. You'll be using a few different commands:

- [docker](https://docs.docker.com/engine/reference/commandline/cli/)
- [docker-compose](https://docs.docker.com/compose/reference/overview/)
- [docker-machine](https://docs.docker.com/machine/reference/)
- [docker-pf](https://github.com/noseglid/docker-pf)

**NOTE:** Make sure you've at least done [step 1](https://docs.docker.com/mac/step_one/).

### Docker Compose
You need to use [docker compose](https://docs.docker.com/compose/) for local dev. It allows you to set up a simple `docker-compose.yml` file that will bundle all of the ugly `docker` cli commands together for you. If you see a tutorial that has you typing `docker ...` on the command line there's probably a better way to do that inside a `docker-compose.yml` file. You'll see a bunch of documentation about firing up an image with something like: `docker run --name wordpressdb mysql`. Don't be confused! If you were deploying to a production environment the `docker` cli would make sense. For local development you should use `docker-compose`.

Using `docker-compose` you can get a server running in no time at all (sort of). There's actually a great tutorial that walks through the basics of [using the official Wordpress image](http://www.sitepoint.com/how-to-use-the-official-docker-wordpress-image/). There's also a very light tutorial in the docker compose manual for getting started with [docker compose and wordpress](https://docs.docker.com/compose/wordpress/) (although it's low on details and slightly out of date).

Docker has recently moved to a [version 2 file format](https://docs.docker.com/compose/compose-file/#versioning) and it breaks a few things (namely, [env variables for linked containers](https://docs.docker.com/compose/link-env-deprecated/)). If you're following an example that doesn't have `version: '2'` at the the top of the `docker-compose.yml` file it will work slightly differently. It's recommended to switch to version 2 because you get other cool features that you'll want to utilize later... so you're going to have to [familiarize yourself with the differences](https://docs.docker.com/compose/compose-file/#upgrading) while the documentation catches up.

If you want to start with the official wordpress image there's an unmerged [pull request](https://github.com/docker-library/docs/pull/532/files) with an example `docker-composer.yml` showing the new v2 syntax. It's essentially the same except there are more environment settings that are required compared to the [Sitepoint tutorial](http://www.sitepoint.com/how-to-use-the-official-docker-wordpress-image/) linked above.

#### Here's the TLDR;

**Create a `docker-compose.yml` file**
You'll want to open your terminal and do something like this:

```
$ mkdir tldr
$ cd tldr
$ touch docker-compose.yml
$ subl docker-compose.yml
```

Paste this into `docker-compose.yml`

```yaml
version: '2'

services:
  wordpress:
    image: wordpress
    ports:
       - "8080:80"
    volumes:
      - data-web:/var/www/html/wp-content/uploads:rw
    environment:
       WORDPRESS_DB_PASSWORD: example
       MYSQL_PORT_3306_TCP_PROTO: tcp
       WORDPRESS_DB_HOST: db

  db:
    image: mariadb
    volumes:
      - data-db:/var/log/mysql
    environment:
       MYSQL_ROOT_PASSWORD: example

volumes:
  data-web: {}
  data-db: {}
```

### Connecting to Docker daemon
Docker is designed for people who know how to manage a computer from the command line. That means you have to configure your local environment or remember a bunch of commands. This can be confusing, especially if you set up docker a while ago and don't remember each step of the [Docker machine get started](https://docs.docker.com/machine/get-started/) tutorial.

With your `docker-compose.yml` file created you should be able to start it up easily from the command line in the same directory. Except... **you can't run `docker-compose up` from the command line until you set the docker environment variables.**

```
$ docker-compose up
ERROR: Couldn't connect to Docker daemon - you might need to run `docker-machine start default`.
```

You need to ignore that error message -- it's misleading. The most likely problem is that your environment doesn't have all of the docker environment variables. Thankfully Docker makes it easy with the [`docker-machine env default` command](https://docs.docker.com/machine/reference/env/). **TODO:** add that command to your bash profile so you don't ever run into this again. **FIXME:** how to do that?

It's easier if you just run that command every time you try to run `docker-compose`. It will look like this:

```
$ eval $(docker-machine env default) && docker-compose up
Creating network "tldr_default" with the default driver
Creating tldr_db_1
Creating tldr_wordpress_1
Attaching to tldr_db_1, tldr_wordpress_1
...
```

### Port forwarding, or, making `localhost` work
You should have a development server running from the previous step. What now? We would like to view our new Wordpress site in a browser. Most tutorials completely skip this step or guide you into some complicated mess of looking up IP addresses. Networking is hard. Thankfully you can skip all of that and use a simple tool called [Docker port forwarder](https://github.com/noseglid/docker-pf) which makes all of your docker images appear on your Mac's localhost.

#### Your server isn't available on localhost by default
Let's try opening our Wordpress instance in Chrome (pro tip: you can do that form the command line).

```
$ open -a Google\ Chrome http://localhost:8080
```

That probably didn't work. Your docker images get weird IP addresses by default. Docker manages this for you and it's easy enough to get it working in a production environment. For development the random IP addresses are really annoying.

#### Install `docker-pf`
Now let's install `docker-pf` and try it again.

```
$ npm install -g docker-pf
```

#### Run `docker-pf` when you want to access your local dev servers.
Start the port forwarder. This will forward the ports from those random IP addresses to your localhost so that it's easy to find your services. You need `docker-pf` running for it to work. We'll cover how to make this slightly easier later on.

```
$ docker-pf
```

#### With `docker-pf` your server should be available
Now that the ports are forwarded we should be able to open our dev environment in Chrome.

```
$ open -a Google\ Chrome http://localhost:8080
```

That should be much better. Of course now we're in a small pickle. Our simple "up" command is getting messy.

```
$ eval $(docker-machine env default) && docker-compose up -d && docker-pf
```

## Keeping track of common commands
One of the easiest way to keep track of and run common commands is using a `package.json` file and NPM. It is now common practice to [utilize NPM as a build tool](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/). Even though we're working with PHP, it's still going to be easier to store our commands in a package.json file. Once you've got a good flow going you may enjoy creating a bunch of shell scripts for managing these tasks. For now, NPM will be the easiest.

#### Initialize your `package.json` file
Let's initialize NPM inside the `tldr` folder we created earlier. Follow the instructions, it doesn't really matter how you fill it out until you feel like publishing this package to NPM, which we won't be doing. If you want to, just hit the return key and use all of the default answers.

```
$ npm init
```

#### Open the package.json file
In the package.json file under `scripts` there should already be a test command. You can add others. You could run test using `npm run test`. Let's add one called `docker:env` and run it using `npm run docker:env`.

```
$ subl package.json
```

Add a new `docker:env` command:

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "docker:env": "eval $(docker-machine env default)"
  },
```

Now we can run it, although it won't really do anything useful just yet.

```
$ npm run docker:env
```


