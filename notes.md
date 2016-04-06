Me: Hey, I figured out docker last night
Holy shit... It's the way to do it.

Xman: Yeah?

Me: Oh yeah
Local dev is like "node + Postgres + redis" and it just works
Some tiny tricks needed to make it easy for local dev but those were not so bad to figure out
But db and redis just work

Xman: And that’s just a container that someone else already created and configured?

Me: And then to deploy you either use cloud.docker and manage your deployment or you use Google Container engine. But it's dead simple. "I need x machines with these images in them and make sure they're wired together and restart themselves
The prebuilt containers are the way to go
And they make it dead simple to extend them

Xman: That’s cool

Me: So if you wanted to run iron ruby in production it'd be as easy as image:ironruby

Xman: So there’s just an additional config file or similar to add addition packages?

Me: Yeah
Amazingly simple
And the build times are less than you'd believe
If you've used vagrant, this is a dream
There's no reason to ssh into the machine ever
It's made for dummies

Xman: That sounds great

Me: The least time I've ever spent deciphering how to get my server configured

Xman: All this from the docs on their site? Or from a blog post?

Me: There's some advanced stuff that looks hard
I had to dig and dig
They've got nothing but hello world examples and it all seems too simple to be usable
But it finally "clicked" after fucking with it for a while
And I found a good dev stack setup
The trick is the production setup, there's less info there

Xman:
Like you have to make additional modifications to the settings in prod

Me: Yeah. You actually do them totally different in some cases
I didn't find a professional looking thing. I think the cloud dashboards pretty much do that for you
So you just point to your app repo and wire up your machines and it can do all the pro shit for you

Xman:
Ah so you’re saying the docker providers have dashboard that would help you manage your container config in prod?

Me: Yeah
I'll bet if you read the docker-composer pages on getting started with rails you'd be impressed

Xman:
I should do that
I’ve been kind of useless this year

Me: Docker-composer is for local dev

Xman:
https://docs.docker.com/compose/rails/

Me: The trick to get things showing on your local host like you like is docker-pf
1) make the yaml file
2) docker-pf && docker-compose up
3) profit
I mean pf like port forward

Xman: ah

Me: Docker-pf
It's dead simple

Xman: reading…

Me: And stop thinking you need to config your db

Xman: the tutorial seems fine looking at the compose api now
https://docs.docker.com/compose/compose-file/

Me: The idea is your db image is part of your company's collection. So it's like My-company-db-dev
Your compose file is just how you link things together
And your local Dockerfile is for configuring your app server

Xman: I’m not quite getting the build argument

Me: Skip that
Also, you'll see a bunch of stuff about boot2docker
Skip that
Install docker from the Mac app
Install virtualbox
In an empty folder put something like Dockerfile image from the docker rails tutorial
Make the yaml file from the tutorial
Then docker-compose up
Which builds for you
The build is like running bundle install before you run rails server
It adds a container to your system default vm
Then you can start that container with docker run

Xman: Where’s docker-pf i don’t see that anywhere

Me: But... Skip all that. Compose does it for you
docker-pf is a small node lib

Xman: i see mentions of adding EXPOSE and then having to tell virtual box to poke a hole

Me: Right
Expose is to virtual box
But it just doesn't work

Xman: send me a link to pf?

Me: https://github.com/noseglid/docker-pf
http://blog.csainty.com/2015/10/docker-on-osx.html
That saved me
From there I could easily localhost:3000

Xman: kew

Me: And don't home brew it like that guy suggests

Xman: no? why not?

Me: The gui packages are better
They are official and stuff

Xman: https://kitematic.com/?

Me: https://docs.docker.com/mac/step_one/

Xman: right same same

Me: You never need to open kinematic
It's junk

Xman: lol

Me: Same with QuickStart terminal
But... It's easier than if brew is wrong and something doesn't work when it should

Xman: This sounds sweet tho
Thanks for sharing
Write a blog post?
