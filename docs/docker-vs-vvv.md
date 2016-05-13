# We Used to Use Vagrant

Vagrant is a fantastic tool. There are lots of great implementations of it, and for WordPress development, the tools offered by Varying Vagrant Vagrants are fantastic; WP-CLI, Xdebug, etc. It also offers a turnkey environment for multiple WordPress projects on one machine, and we've been using that, literally serving dozens of sites at a time so we could deftly switch between projects. 

## So, what's the problem?

There are a few for us. If you are a developer contributing to WordPress core, VVV has all the tooling right there in the box, and it's what you want. If, however, your desire is to develop on a sane environment that mirrors your production stack, and (as with our clients) many of your projects are on different servers running various configs, VVV isn't going to work for you. As for us, we have several sites in Apache, and VVV currently runs Nginx. We love Nginx but for various boring reasons, we can't use it everywhere yet. In addition, VVV's performance on our machines is abysmal, and we weren't really ever able to improve it drastically. 

Recently, our solution to this was to use [Scotch Box](https://box.scotch.io/), a lightweight, fast LAMP Vagrant box that works great and with a little finagling can handle mutliple domains on a single machine. Once again, though, different projects often end up having different staging and production setups, we found ourselves whistling past the graveyard during many deployments. 

## So, Docker

Yeah, the end goal here is to produce a portable, flexible workflow for development on WordPress Bedrock and deployment through Docker to any number of different environments. At the moment, we're still using Capistrano for deployments, so we're just getting started, but as Docker continues to mature and as we learn more about best-practices, we'll be using it to create and end-to-end workflow and deployment for WordPress and Bedrock. 