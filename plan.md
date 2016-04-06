Rework the [wordpress-starter](https://github.com/visiblevc/wordpress-starter) and the [official wordpress image](https://github.com/docker-library/wordpress/tree/master/apache) to use [bedrock](https://roots.io/bedrock/docs/installing-bedrock/) as the starting point.

The Wordpress starter has an excellent [blog post](https://visible.vc/engineering/wordpress-developer-workflow/) detailing a development workflow that suits their needs. They don't use bedrock but they use some other cool tricks, incuding relying on [wp-cli](http://wp-cli.org/).

If you're really new to Docker and Wordpress, it's useful to start with these SitePoint posts for [configuring wordpress manually](http://www.sitepoint.com/how-to-manually-build-docker-containers-for-wordpress/) and [using the official image](http://www.sitepoint.com/how-to-use-the-official-docker-wordpress-image/).

Wordpress is super easy to set up but for local development, managing plugins, etc isn't quite as easy. For one, the volume doesn't mount correctly and isn't writable by Wordpress ([confusing stack overflow discussion](http://stackoverflow.com/questions/23544282/what-is-the-best-way-to-manage-permissions-for-docker-shared-volumes)). The workaround is to mount only the directories you need and to leave the rest of them in place. It makes a certain amount of sense that you wouldn't mount a directory you needed the server to write to. Writable directories should be mounted as volumes. Becaue of the way the official WordPress image auto-installs Wordpress this is a little confusing out of the gate.

Docker has made some recent changes that make working with volumes much easier... but mostly for power users.
- An example of [how volumes work](https://clusterhq.com/2015/12/09/difference-docker-volumes-flocker-volumes/)
- The [original volumes proposal](https://github.com/docker/docker/issues/9250)
- The [original volumes problem](https://github.com/boot2docker/boot2docker/issues/581)
- The problem [exists in kitematic](https://github.com/docker/kitematic/issues/209) as well.
- Everyone is [having the same problem](https://github.com/docker-library/ghost/issues/19#issuecomment-132836412).

Some things to know about the default image:
- `/var/www/html` is the default web root. This serves as the root for the vanilla wordpress install
- all other wordpress directories are relative to there, like `wp-content/` is located at `/var/www/html/wp-content/`
- it is recommended to mount only the folders that you change and leave the rest untouched.

also: http://blog.next-revision.com/laravel-on-docker/

```yaml
# this should work just fine
wordpress:
  image: wordpress
  links:
    - mysql:mysql
  ports:
    - 8080:80
  working_dir: /var/www/html/
  volumes:
    # this won't be writable, chmod -R 777 will help but it still can't edit files
    # the default image tries to write to this folder and will overwrite it
    # this stinks... bedrock will be nicer, but still have some file-writing issues
    - ./wordpress/:/var/www/html/

mysql:
  image: mysql
  #it's best practice to mount your 
  volumes:
    - ./data:/var/lib/mysql
  environment:
    MYSQL_ROOT_PASSWORD: example

```

Docker has recently moved to a version 2 file format and it breaks a few things ([env variables for links](https://docs.docker.com/compose/link-env-deprecated/)). There's an unmerged [pull request](https://github.com/docker-library/docs/pull/532/files) for an example `docker-composer.yml` with the new v2 syntax. There are more environment setting that are required to be set.

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
# it's cool to add data volumes for the db and uploads
volumes:
  data-db: {}
  data-web: {}
```

There's another good example over at [indiehosters](https://github.com/indiehosters/wordpress) with a [Dockerfile](https://github.com/indiehosters/docker-wordpress) that extends the official wordpress image. You can easily override the entrypoint and cmd. In our case, the entrypoint.sh needs to be overridden to support bedrock. In their cases they just wanted to configure a few extra things to get mail working. It serves as a good example that to extend an image, all you're really doing is overriding the ENTRYPOINT and CMD.


## Making this work with bedrock
- replace the official image's entry point script with a version that expects the bedrock directory structure and is tuned to work with composer
- construct a recommended setup that allows you to manage a bedrock repo exactly as they have it but mount the few things you need to get it working without running into directory write issues. This might mean keeping a big awkward list fo exactly which files to copy over.
- Try to steal as much good stuff as possible from the wordpress-starter project, especially the cool wp-cli integration


