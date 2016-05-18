# Setting up a Development Environment

Here are detailed instructions for getting your machine set up to develop locally. You can read about why you might want to do this, or just get right to it.

## Step 0: Make Sure Docker Works

If you haven't already, make sure you have Docker Toolbox working and that you can run [the "Hello World" example](https://docs.docker.com/mac/step_one/) in their docs. In addition, if you're running other Docker stuff or Vagrant stuff or anything with VirtualBox already, you might want to shut it all down and start clean. Maybe it's fine, but there are things like port collisions and performance issues that we ran into in our initial installs that all went away after removing a few errant misbehaving vagrant machines. 

No problems there? You can proceed and the following steps _should_ work out of the tin. Once again, this is all Mac OSX-specific. 

## The Rest of the Steps

1. **Create a folder to house your Docker Bedrock projects**. We just call it `bedrock-sites` and throw it in our home folder but the name doesn't matter. From the terminal: `mkdir ~/bedrock-sites && cd ~/bedrock-sites`
2. **Pull down the latest version of this repo.** Naming conventions are of course important to keep chaos at bay, so we name our individual project folders after the eventual production domain of the project. This guide will be setting up a project that will live at example.com, thus: `git clone https://github.com/heygrady/docker-wordpress-starterkit.git example.com && cd example.com`
3. **Install dependencies** via `npm install`. The only current npm module required is [docker-pf](https://github.com/noseglid/docker-pf).
4. **Fire up docker machine.** You should only have to run this command if docker-machine isn't running already: `docker-machine start default || true && eval $(docker-machine env default)` Getting errors already? Restart everything, and maybe run through the Docker Toolbox thing again.
5. **Clone Bedrock, freshly.** For convenience, enter `npm run bedrock:init` and NPM will clone the latest/greatest from Bedrock on Github into a directory at `example.com/bedrock/`, which is useful if starting a brand-new project. If you already have a Bedrock project in Git somewhere, you can add an optional flag to pull that down instead: `npm run bedrock:init --docker-wordpress-starterkit:repo=git@github.com:exampleuser/git-repo-name.git`
6. **Run Docker Compose** This reads through all our Docker stuff and brings up the Apache/PHP server and MariaDB/MySQL containers in the Docker Machine, and also runs a `composer install` for you: `npm run docker:up:daemon` **N.B.!** Depending on lots of things, it may take awhile for all these services to come up (especially if composer has a bunch to do), and until they do, you won't be able to access the site locally. Be patient, sometimes it takes several minutes!
7. **Try to access the site.** When the services are all done starting, if you use Chrome you can just `open -a Google\ Chrome http://localhost:8080` and your site will come up. If you get an error message in the browser, as in "localhost didn’t send any data." then it's probably fine, just still starting up. "This site can't be reached" is maybe bad. Try starting the stuff with just `npm run docker:up` and read the output in the terminal. Most problems are due to ports not being forwarded and software being out-of-date.
8. **Run through the installation if this is a new project.** Ah yes, the WordPress installation screens, as familiar and exciting as the back of your hand. If this is a new project, you're done and I'm sure you can take it from here. 
9. **Use [Sequel Pro](http://www.sequelpro.com/) to import legacy MySQL dump.** Chances are, you have this Bedrock project somewhere else already. There are Docker-specific methods for importing stuff to MySQL in a container, but more magical is this: `npm run docker:db:open` which will open Sequel Pro right to your DB for importing (and later, manipulation of actual data via a GUI)

You can now embark on development as you always have. All the stuff in version control for your specific project should live in the `example.com/bedrock` folder, and you can push commits, etc. from there. 

## Ok, Now How Do I Turn it Off?

Docker, in all its wonderful portability, destroys your whole container when you shut it down. This presents many advantages but it also means we need to store SQL dumps somewhere if we want the site data to persist. That somewhere is `example.com/data`, and we have a convenience method that takes care of things. In short: **If you need the database to persist, shut down with** `npm run docker:down:dump`. This will export the DB schema and data in a way that will be automatically restored on your next `npm run docker:up:daemon`