# Docker and WordPress
### *A personal journey*

WordPress is easy. Docker is easy. There's a ready-made [official container for WordPress](https://hub.docker.com/_/wordpress/)... so why isn't this easy to do? In a word: networking.

Getting computers to talk to each other is an age old problem and virtualization hasn't changed that one bit. Running your code in a Docker container is effectively the same thing as running it in any other virtual machine or on another computer altogether. Under the hood on a Mac, Docker just uses VirtualBox. It's not all bad. Docker actually does the hard work of "making networking easy" but networking is still so difficult that you are bound to run into a few snags, particularly for local development.

Using virtual containers for local development can take much of the hassle out of configuring your dev environment and sharing it with your team. The [toolbox for working with Docker](https://www.docker.com/products/docker-toolbox) is getting much better; with [docker-compose](https://docs.docker.com/compose/) and [docker-machine](https://docs.docker.com/machine/) it's getting trivial to manage your dev environment in the same repo where you manage your code (at least for getting started). Docker Hub makes it easy to manage your own repositories of servers and even keep them private.

All good? Not quite.

Docker is still designed primarily to be used by a professional who already knows how to manage servers in the cloud. Docker actually starts making more sense the closer you get to using it in production -- in particular, some of the local development roadblocks start to look like useful features in a cloud environment. There's a lack of documentation because of the newness of the technology and the general audience it serves. Anyone who is used to the extremely kind and coherent documentation that comes from PHP or [MDN](https://developer.mozilla.org/en-US/) or from the WordPress community will already be familiar with how jarring it is to look up documentation about UNIX commands or configuring servers. Docker is *all about* UNIX commands and configuring servers and the documentation isn't always illuminating from a developers perspective. (Apologies in advance if you are a server pro and think the documentation is perfect because it doesn't waste any breath coddling the newbies).

For a developer who wants get up and running with docker there are a number of pitfalls. Digging through the issues is a dizzying experience for someone just trying to get a local development environment set up. 

There's also a few terrible roadblocks.

## A quick note
This is written assuming you want to develop WordPress on a Mac using Docker to manage your local dev environment. You should have already installed the [Docker toolbox](https://www.docker.com/products/docker-toolbox). There is a really great tutorial for [getting docker working smoothly on OS X](http://blog.csainty.com/2015/10/docker-on-osx.html). But it's probably best to just install the [Docker toolbox](https://www.docker.com/products/docker-toolbox) for Mac. It will [install VirtualBox](https://www.virtualbox.org/wiki/Downloads) for you if you don't already have it. 

Currently Docker has a confusing ecosystem of command line tools. The good news is that they are rapidly working to upgrade everything to a more idiot-proof work flow. The bad news is they aren't there yet. In the meantime we're stuck with a few different commands and tools required to get things going. You'll be using a few different commands:

- [docker](https://docs.docker.com/engine/reference/commandline/cli/)
- [docker-compose](https://docs.docker.com/compose/reference/overview/)
- [docker-machine](https://docs.docker.com/machine/reference/)
- [docker-pf](https://github.com/noseglid/docker-pf)

**NOTE:** Make sure you've at least done [step 1](https://docs.docker.com/mac/step_one/).

## Docker Compose
You need to use [docker compose](https://docs.docker.com/compose/) for local dev. It allows you to set up a simple `docker-compose.yml` file that will bundle all of the ugly `docker` cli commands together for you. If you see a tutorial that has you typing `docker ...` on the command line there's probably a better way to do that inside a `docker-compose.yml` file. You'll see a bunch of documentation about firing up an image with something like: `docker run --name wordpressdb mysql`. Don't be confused! If you were deploying to a production environment the `docker` cli would make sense. For local development you should use `docker-compose`.

Using `docker-compose` you can get a server running in no time at all (sort of). There's actually a great tutorial that walks through the basics of [using the official WordPress image](http://www.sitepoint.com/how-to-use-the-official-docker-wordpress-image/). There's also a very light tutorial in the docker compose manual for getting started with [docker compose and WordPress](https://docs.docker.com/compose/wordpress/) (although it's low on details and slightly out of date).

Docker has recently moved to a [version 2 file format](https://docs.docker.com/compose/compose-file/#versioning) and it breaks a few things (namely, [env variables for linked containers](https://docs.docker.com/compose/link-env-deprecated/)). If you're following an example that doesn't have `version: '2'` at the the top of the `docker-compose.yml` file it will work slightly differently. It's recommended to switch to version 2 because you get other cool features that you'll want to utilize later... so you're going to have to [familiarize yourself with the differences](https://docs.docker.com/compose/compose-file/#upgrading) while the documentation catches up.

If you want to start with the official WordPress image there's an unmerged [pull request](https://github.com/docker-library/docs/pull/532/files) with an example `docker-composer.yml` showing the new v2 syntax. It's essentially the same except there are more environment settings that are required compared to the [Sitepoint tutorial](http://www.sitepoint.com/how-to-use-the-official-docker-wordpress-image/) linked above.

#### Here's the TLDR;

**Create a `docker-compose.yml` file.** You'll want to open your terminal and do something like this:

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

## Connecting to Docker daemon
Docker is designed for people who know how to manage a computer from the command line. That means you have to configure your local environment or remember a bunch of commands. This can be confusing, especially if you set up docker a while ago and don't remember each step of the [Docker machine get started](https://docs.docker.com/machine/get-started/) tutorial. Later we'll be creating a simple way to write down and re-use all of the common commands that we need to run. They are part of the code you need to run your project so you should treat them as such and manage them with version control. More on that later.

With your `docker-compose.yml` file created you should be able to start your server up easily from the command line in the same directory. Except... **you can't run `docker-compose up` from the command line until you set the docker environment variables.**

```
$ docker-compose up
ERROR: Couldn't connect to Docker daemon - you might need to run `docker-machine start default`.
```

You need to ignore that error message -- it's misleading. The most likely problem is that your environment doesn't have all of the docker environment variables. (Be sure you have installed the [docker toolbox](https://docs.docker.com/mac/step_one/)). Thankfully Docker makes it easy with the [`docker-machine env default` command](https://docs.docker.com/machine/reference/env/). **TODO:** add that command to your bash profile so you don't ever run into this again. **FIXME:** how to do that?

It's easier if you just run that command every time you try to run `docker-compose`. It will look like this:

```
$ eval $(docker-machine env default) && docker-compose up
Creating network "tldr_default" with the default driver
Creating tldr_db_1
Creating tldr_wordpress_1
Attaching to tldr_db_1, tldr_wordpress_1
...
```

## Port forwarding, or, making `localhost` work
You should have a development server running from the previous step. What now? We would like to view our new WordPress site in a browser. Most tutorials completely skip this step or guide you into some complicated mess of looking up IP addresses. Networking is hard. Thankfully you can skip all of that and use a simple tool called [Docker port forwarder](https://github.com/noseglid/docker-pf) which makes all of your docker images appear on your Mac's localhost.

#### Your server isn't available on localhost by default
Let's try opening our WordPress instance in Chrome (pro tip: you can do that form the command line).

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
One of the easiest ways to keep track of and run common commands is using a `package.json` file and NPM. It is now common practice to [utilize NPM as a build tool](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/). Even though we're working with PHP, it's still going to be easier to store our commands in a package.json file. Once you've got a good flow going you may enjoy creating a bunch of shell scripts for managing these tasks. For now, NPM will be the easiest.

#### Initialize your `package.json` file
Let's initialize NPM inside the `tldr` folder we created earlier. Follow the instructions, it doesn't really matter how you fill it out until you feel like publishing this package to NPM, which we won't be doing. If you want to, just hit the return key and use all of the default answers.

```
$ npm init
```

#### Edit the `package.json` file
In the package.json file under `scripts` there should already be a test command (that doesn't do anything). You can add others that are more useful. You could run tests using `npm run test`. Let's add one called `docker:env` and run it using `npm run docker:env`.

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

### Adding some other commands.

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "docker:env": "eval $(docker-machine env default)",
    "docker:pf": "npm run docker:env -s && docker-pf 0<&- &>/dev/null & \n",
    "docker:pf:down": "kill $(ps aux | grep docker-pf | grep -v grep | awk '{print $2}') || true",
    "docker:up": "npm run docker:pf -s && docker-compose up -d",
    "docker:down": "docker-compose down && npm run docker:pf:down -s",
    "docker:shell": "docker exec -it $(docker ps --format \"{{.ID}}\" --filter \"name=wordpress\") bash"
  },
```

| Command              | Description |
| ---                  | ---         |
| `npm run docker:env` | Sets the docker environment variables. This doesn't work exactly like you'd expect when you run it through NPM. It doesn't actually set the variables in your shell but in the environment that NPM is executing within. This is most useful when combined with other commands. |
| `docker:pf`          | Starts the docker-pf port forwarding script in background mode. |
| `docker:pf:down`     | Kills the docker-pf port forwarding script. |
| `docker:up`          | Starts the port forwarding script and starts your servers. |
| `docker:down`        | Stops the servers and stops the port forwarding script. |
| `docker:shell`       | Launches an interactive shell in the docker machine. |

# Volumes
## Adding your local files to a docker image
Adding your files to a docker image is dead simple and extremely versatile. You can mount individual files, or a whole folder. You can mount a folder within a mounted folder, you can mount folders from one container to the other. The only restriction is that the mounted volume must be on the same network as the container or it must be on the host. There is a poorly documented restriction that -- specifically on a Mac -- if you mount a folder from the host it will only be writable by `root` or the `docker:staff` user within the container. This is the biggest pitfalls of all for Mac users. In particular it's painful for WordPress development (because WordPress likes to write files).

What does this mean? It means that it's easy to mount your code from your laptop into your docker container but the docker container won't be able to write to it unless you fiddle with it first. But even then the fix seems a little wrong. There are many threads on this but the most famous one is [ticket #581](https://github.com/boot2docker/boot2docker/issues/581). More on volumes below.

### Mounting all of WordPress for fun
If we wanted to be particularly lazy, we could mount all of WordPress like this: `./wordpress/:/var/www/html/:rw`. That's actually something fun to try because it shows just how much magic the WordPress image is doing under the hood.

Open your terminal and navigate to the `tldr` folder we created earlier. We need to create an empty `wordpress` folder. When you mount a folder it needs to exist, but it's cool if it's empty.

```
$ mkdir wordpress
```

Then edit your `docker-compose.yml` file to mount your empty `wordpress` folder as `/var/www/html/`.

```yaml
version: '2'

services:
  wordpress:
    image: wordpress
    ports:
       - "8080:80"
    volumes:
      - ./wordpress/:/var/www/html/:rw
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

Now we can launch our docker image and see what happens. Make sure to bring down any previously running containers, otherwise you'll get a warning.

```
$ npm run docker:down && npm run docker:up
$ open -a Google\ Chrome http://localhost:8080
```

Surprise! Your empty folder is now filled with a vanilla install of WordPress. Why? How? I thought that it wouldn't be able to write to volumes mounted from a Mac host? Well, the WordPress image does some checks when it starts up using an `entrypoint.sh` script that runs as the `root` user. This is the script that installs WordPress on the image. And since we mounted our folder where the image normally puts WordPress, it put WordPress in our folder! What's more is that the script looks to see if WordPress already exists in that folder before copying any files into it. In production you could mount your own WordPress installation like we have done here and everything will *just work*.

**Note:** the `entrypoint.sh` script does some specific checks for the existence of WordPress and if you're doing something exotic, like using [Bedrock Wordpress](https://roots.io/bedrock/), you'll get some unexpected results -- because it won't find the specific files it looks for -- unless you overwrite the `entrypoint.sh` script. More on that later.

You can view the site in a browser and it should work fine. But try to install a plugin through the admin and you'll see the dreaded "FTP" page that indicates that WordPress doesn't have write permissions. Additionally, if you go through the WordPress install wizard the `wp-config.php` won't be updated either -- no writes from WordPress itself because it runs as `www-data:www-data`, well after the `entrypoint.sh` has done its work. If you bring the site down and start it back up we'll be back at square one; staring at the install wizard. Again, in production this won't be such a problem because it will be able to perform writes properly on your mounted persistent data volume.

### Dead-simple mounting your own local files
Let's augment our `docker-compose.yml` file again. For simplicity we'll presume you've got some local files that look like this the following directory structure. Basically, you should have something that looks like a vanilla WordPress install on your local.

```
tldr/
  wordpress/
    wp-admin/
    wp-content/
      plugins/
      themes/
      upgrade/
    wp-includes/
  docker-compose.yml
  package.json
```

Now we can add a new volume to our `docker-compose.yml` file, like `./wordpress/wp-content/themes/:/var/www/html/wp-content/themes/:ro`. The WordPress container will automatically snag the latest WordPress and place it inside of `/var/www/html/` within the container. All we have to do is mount the files we wish to change into that folder and the container will serve our local files instead of the files from the vanilla WordPress install. The benefit here is that it's best practice to leave the vanilla WordPress files untouched, usually you only need to edit files in the `wp-content` folder.

**Note:** When you mount a docker volume you can specify `:ro` for "read-only" or `:rw` for "read-write". If you're mounting a volume from a Mac host the `:rw` won't work exactly as expected for the reasons outlined above and below. Specifying `:ro` will prevent even the `root` user from writing to the folder.

Below I'm mounting only the `themes` folder and the `wp-config.php` file. As a best practice you should individually mount only the files and folders that are unique to your project. Keep in mind that WordPress won't be able to write to folders you mount from a Mac host. It's fine to be surgical about it and mount *very* specific things. Also, the uploads folder is mounted to a docker data volume. **TODO:** I can't find a good explanation on how they work.

- **TODO:** What files and folders does someone need to mount for a typical vanilla WordPress install?
- **TODO:** What's the best way to manage plugins? There is a good example of doing this with an environment variable in the [visiblevc/wordpress-starterwordpress-starter](https://github.com/visiblevc/wordpress-starter) but that's extra `entrypoint.sh` script magic.
- **FIXME:** This doesn't actually work as expected because the default `entrypoint.sh` script tries to overwrite the `/var/www/html` folder if it doesn't detect WordPress. Our mounted files and folders will already exist by the time the script runs, but since the script didn't detect a full WordPress install it will overwrite the entire `/var/www/html/` directory, including the files we mounted. If you mount them as `:ro` they won't be overwritten but the entrypoint script will fail and your server won't start properly. In a production environment you'd probably just mount all of WordPress to have more control over which version is running, etc. For local development you'd want this to *just work*. The means we're going to need to craft our own `entrypoint.sh` script to change the default behavior.

```yaml
version: '2'

services:
  wordpress:
    image: wordpress
    ports:
       - "8080:80"
    volumes:
      - data-web:/var/www/html/wp-content/uploads:rw
      - ./wordpress/wp-config.php:/var/www/html/wp-config.php
      - ./wordpress/wp-content/themes/:/var/www/html/wp-content/themes/:ro
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

## The trouble with volumes
- An advanced example of [how volumes work](https://clusterhq.com/2015/12/09/difference-docker-volumes-flocker-volumes/)
- The [original volumes proposal](https://github.com/docker/docker/issues/9250)
- The [original volumes problem](https://github.com/boot2docker/boot2docker/issues/581)
- The problem [exists in kitematic](https://github.com/docker/kitematic/issues/209) as well.
- Everyone is [having the same problem](https://github.com/docker-library/ghost/issues/19#issuecomment-132836412).

As mentioned above, volumes mounted from a Mac host are only writable from `root` or the `docker:staff` user. The best work around for this is discussed in the official docker Mysql image repo. In [ticket #99](https://github.com/docker-library/mysql/issues/99) someone is trying to mount a volume into their mysql container so that all of the database writes will be written to the host machine. Conceptually, this is the easiest way to persist the database when you're working locally with docker -- except it doesn't work because Mysql can't write to the mounted folder. In a server environment the mounted volume might be on a persistent storage container in your cloud. On your local machine that seems like overkill and most users would rather just store it on their host machine. Because the host machine is a Mac, the file permissions don't match up and the permissions default to `root` and the `docker:staff` user (which is problematic because the mysql container writes files as the `mysql` user). The suggested workaround is to have the `mysql` user within the container have the same privileges as the  `docker:staff` user. This feels a little hacky but it's reasonably easy to do. This same approach would solve our WordPress problems, we could extend the official WordPress image and alter the user permissions for the `www-data:www-data` user to match the `docker:staff` user.

But there's actually an easier solution... don't mount volumes that the server needs to write to. In practice there should rarely be a case where the server is writing changes to your files that you'll want to commit to your repository. For WordPress development that isn't 100% true but it's a good rule of thumb. Mounting writable volumes is hard, and it's bad practice to write to them anyway. In the MySQL example, mounting a writable volume is the only way to have your data persist properly in a cloud environment. After looking through some other WordPress Docker setups it seems that for local development it may not be necessary to have the DB mounted locally at all. It's probably easy to just use sql dumps so that you can easily control which mock data to load.

### A better approach for local volumes

**TODO:** finalize this approach into a workable solution. It will require creating our own `entrypoint` script.

Here's an outline of our approach:
- It's possible to `ADD` files from your host machine. This copies them into the container instead of mounting them. The one caveat is that once you copy files into the container you can't easily edit them. You only want to do this for files that don't change -- like vanilla WordPress.
- For WordPress, only mount the files and folders that you need to edit during development. This will make it easy change your files and see the results on the dev server instantly without having to restart anything.
- If you need to grab a server-written file you can always use `docker cp` to copy it from the container to the host. You could also write a command that did this for you if you regularly needed to pull down or push up some specific files.
- For the database, it's probably better to have an entry point script that loads a `backup.sql` from a mounted data directory.
- You can easily write a command to back up the database and store it on the host using `docker run` and even edit our `npm run` commands to automatically back up the db before calling `docker-compose down`. Since it's a dev database it's probably not critical to have the real mysql data directory unless you had a clear idea of what you were going to do with it. For production you'd follow best practices for persisting your mysql data volume in your cloud.

Because you can mount files into container as much as you please you can do some pretty crazy stuff.

# Entrypoints
To get any further with our installation, we need to replace the `entrypoint.sh` script that the official WordPress image uses with one that plays nicer with our desired workflow. There's actually great example in [ticket #99](https://github.com/docker-library/mysql/issues/99) of overriding the default entrypoint from your `docker-compose.yml` file. We need to make our own shell script, mount it into the wordpress image and add an `entrypoint` to our `docker-compose.yml` file to execute that script before it starts the server.

- The [example we're mimicking](https://github.com/neam/docker-stack/blob/1a741b0fb2ce59e9c0cadf4516dc61f147e3efc2/stacks/debian-php-nginx.dna-project-base/docker-compose.yml#L103-L112).
- The [official wordpress image `entrypoint.sh`](https://github.com/docker-library/wordpress/blob/master/apache/docker-entrypoint.sh)

## Hello custom entrypoint
First we need to create our shell script. In our `tldr` folder from below, let's make one.

```
$ touch run.sh
$ chmod +x run.sh
$ subl run.sh
```

Add some content to our shell file. Below is a minimal file that does nothing and won't really work.

```bash
#!/bin/bash
set -e

# shell magic goes here

exec "$@"
```

Update our `docker-compose.yml` file to use our new entrypoint, skipping the default entrypoint. We need to mount the entrypoint script with `./run.sh:/run.sh:ro`, we need to add an `entrypoint` and redeclare the `command` from the [default Dockerfile](https://github.com/docker-library/wordpress/blob/master/apache/Dockerfile).

```yaml
version: '2'

services:
  wordpress:
    image: wordpress
    ports:
       - "8080:80"
    volumes:
      - data-web:/var/www/html/wp-content/uploads:rw
      - ./wordpress/wp-config.php:/var/www/html/wp-config.php
      - ./wordpress/wp-content/themes/:/var/www/html/wp-content/themes/:ro
      - ./run.sh:/run.sh:ro
    environment:
       WORDPRESS_DB_PASSWORD: example
       MYSQL_PORT_3306_TCP_PROTO: tcp
       WORDPRESS_DB_HOST: db
    entrypoint:
      - /run.sh
    command:
      - apache2-foreground

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

With this in place our server should start up just fine and we should see an error page ("You don't have permission to access / on this server.") in the browser. This is a good thing! We got our server to run and we bypassed all of the junk that the default entrypoint script usually does for us. Of course this means we didn't actually get wordpress installed, but that's ok! We can fix that in the next steps by adding things to our custom entrypoint.

```
$ npm run docker:down && npm run docker:up
$ open -a Google\ Chrome http://localhost:8080
```

# Creating a new image
At this point we're somehwat bending over backwards to use the default WordPress image when it ultimately does things we don't want it to do. If you're not an expert of shell scripts, starting from a blank slate can be daunting. So, what next? Why not create a new image that does roughly what the WordPress image does and alter the parts of it that don't work the way we wany. If it wasn't explicitly stated before, we're trying to get the [Bedrock](https://roots.io/bedrock/docs/installing-bedrock/) version of WordPress running, so we're going to have to make a few changes.

## Making a custom `Dockerfile`
There are a couple of good examples of a `Dockerfile` for WordPress. The [officical WordPress Dockerfile](https://github.com/docker-library/wordpress/blob/master/apache/Dockerfile), the [WordPress Starter from visiblevc](https://github.com/visiblevc/wordpress-starter/blob/master/Dockerfile) are good starts but the [Bedrock Docker image from pcfreak](https://github.com/pcfreak30/bedrock-docker/blob/master/apache_php/Dockerfile) tackles our Bedrock-specific problems using the official Wordpress image as the starting point. Ultimately it's a matter of taste how to blend all of these together. Each of them has a not-quite-perfect mix of features. For now we'll ignore that all of the images I'm referencing are using Apache even though all of the cool kids are using Nginx and PHP-FPM.

As a rough start, let's create a new folder `servers/wordpress/` and add some files. Presume we're in our `tldr` forlder from before. You can see examples of these files in this repository. They're too long to paste here.

```
$ mkdir -p servers/wordpress
$ touch servers/wordpress/docker-entrypoint.sh && chmod +x servers/wordpress/docker-entrypoint.sh
$ touch servers/wordpress/Dockerfile
$ touch servers/wordpress/php.ini
```

## Updating our `docker-compose.yml` file

```yaml
version: '2'

services:
  wordpress:
    # use our custom wordpress image
    build:
      context: ./servers/wordpress/
      dockerfile: Dockerfile
    ports:
       - "8080:80"
    volumes:
      # mount your bedrock site as /var/www
      - ./bedrock/:/var/www/:rw
    links:
      - db:mysql
    environment:
      # TODO: how do these interact with the .env file? Seem to override it.
      # TODO: WP_ENV: development|staging|production should `cp .env.${WP_ENV} .env`
      DB_NAME: wordpress
      DB_USER: root
      DB_HOST: mysql:3306
      DB_PASSWORD: pass
      WP_HOME: http://localhost:8080
      WP_SITEURL: http://localhost:8080/wp

  db:
    image: mariadb
    volumes:
      # mount your sql backup files to be imported on server launch
      - ./data/:/docker-entrypoint-initdb.d/
      # mount mysql data files to a docker volume
      - data:/var/log/mysql
    environment:
      #MYSQL_DATABASE: wordpress
      MYSQL_ROOT_PASSWORD: pass

volumes:
  #TODO: what precicely does this directive do?
  data: {}

```

## Adding more helpful scripts for managing the database
You can see these new scripts in the `package.json` in this repository. Here is the updated docs below

| Command                          | Description |
| -------------------------------- | ---         |
| `npm run docker:env`             | Sets the docker environment variables. This doesn't work exactly like you'd expect when you run it through NPM. It doesn't actually set the variables in your shell but in the environment that NPM is executing within. This is most useful when combined with other commands. NOTE: hmmmm. This needs explored.       |
| `npm run bedrock:init` | Downloads a fresh copy of Bedrock WordPress to a local `bedrock` directory. |
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
| `npm run docker:db:dump:schema`  | Zips up any existing schema dumps and dumps the current schema to your local `data` directory. |
| `npm run docker:db:dump:data`    | Zips up any existing data dumps and dumps the current data to your local `data` directory. |
| `npm run docker:db:roll:schema`  | Zips up any existing schema dumps and labels them with a timestamp in your local `data` directory. |
| `npm run docker:db:roll:data`    | Zips up any existing data dumps and labels them with a timestamp in your local `data` directory. |

## New workflow

In a fresh directory we can get WordPress running ver quickly.

```
$ git clone https://github.com/heygrady/docker-wordpress-starterkit.git tldr && cd tldr
$ docker-machine start default && eval $(docker-machine env default)
$ npm run bedrock:init
$ npm run docker:up:daemon
# wait for everyhting to initialize, might take a bit
$ open -a Google\ Chrome http://localhost:8080
# go through the install completely
$ npm run docker:db:dump
$ npm run docker:down
```
