---
layout: post
title:  "How to Deploy Django with Git on Ubuntu"
date:   2016-10-03 21:10:00 +0200
tags: ['django', 'dokku', 'how to']
author: "shonin"
---

# Deploying Django with Git to an Ubuntu Server: A Dokku Tutorial

*This tutorial will use the Dokku tool to let you setup your own
 personal Heroku, that you can deploy your apps to with as little as
 a `git push dokku master`*

***Note:*** This tutorial assumes you're at least somewhat familiar
 with using the shell, DNS, SSH, Django, and git

## Step 1) Spin up a *new* Ubuntu Server

* `Ubuntu 14.04 x64` or `Ubuntu 16.04 x64`
* At least 1GB of memory

#### Or, Digital Ocean One Click Deploy

Digital Ocean will install Dokku for you.  
Just sign up for an account with Digital Ocean and deploy.  
[Here is the link](https://www.digitalocean.com/products/one-click-apps/dokku/)

If you do this, skip to step 3


**Note:** Life is easier if you setup SSH keys. Digital Ocean has an
 option to do this on setup, if you went with AWS or some other host
 you can add them after you install Dokku.

## *Optional* - Setup a DNS

1. In your domain provider of choice, navigate into the DNS settings of
a domain that you want to have for the server
1. Add an A Record with the value of "@" pointing to the IP Address of your new Ubuntu server
2. Add a wildcard "*" A Record pointing to the same IP to capture all of the subdomains.

## Step 2) Install Dokku

**SSH into your server:** `ssh root@yourdomain.com` or if you didn't
 setup a domain, it'll be `ssh root@<your ip>`

 *If you didn't setup SSH keys you'll be prompted to login with your root
server password, don't worry you'll be able to set them up in just a
 moment*

**Run these two commands:**

```bash
wget https://raw.githubusercontent.com/dokku/dokku/v0.7.2/bootstrap.sh
sudo DOKKU_TAG=v0.7.2 bash bootstrap.sh
```

When the code is done scrolling and the script is finished, navigate
to your server in a browser, either the servers IP or the domain you
setup. Choose your settings. You can also paste in your public ssh key
 here, which is how you will deploy with git.

![](http://trdforums.org/styles/default/xenforo/smilies/awyeah.png)

## Step 3) Create a New App Container

***On your new Ubuntu Server:***

```bash
dokku apps:create django-tutorial
```
where you can replace `django-tutorial` with you app name

* Yes, that's it. Dokku is Awesome. Being a developer is almost
 easy.

## Step 4) Setup Postgres

*You're seting up a Django app, so I'm assuming you want Postgres, but
if you app doesn't require this then you don't need to do it.*

**Inside your server run:**

```bash
sudo dokku plugin:install https://github.com/dokku/dokku-postgres.git
dokku postgres:create example-database
```

Now you need to link the database to the app

```bash
dokku postgres:link example-database django-tutorial
```

This sets up a postgres database and puts an environment var in your
app container called `DATABASE_URL`. Your Django app just needs to be
 looking for it.

## Step 5) Deploying your Django App

At this point your new server is completely configured. The trick is,
your app needs to be able to run in this type of environment. A quick and ready
to go option is to use [Heroku's Django Template](https://github.com/heroku/heroku-django-template)

From your Django projects repo, add your Dokku container as a remote

```bash
git remote add dokku dokku@<yourserver>:django-tutorial
```

Deploy!

```bash
git push dokku master
```

Depending on how you setup Dokku you'll have a messsage in your terminal telling
your where you can visit your deployed app. I set mine up as a subdomain,
so it'll live at `http://django-tutorial.somedomain.com`

## Uh Oh (AKA how to view logs)

![](http://a.deviantart.net/avatars/o/h/oh-god-why-plz.png?1)

**So you navigated to your app in the browser and got a Server 500 error?**

ssh into your Dokku server and get your app's Container ID, then run
`docker attach` on it.

```bash
docker ps  
CONTAINER ID        IMAGE               ETC
dc1e66f804a9        django-tutorial     etc

docker attach dc1e66f804a9
```

Keep that running in the terminal and then go back to the browser and refresh
to generate some logs. If you don't see anything then maybe you need to put
logging into your app.  

## Adding More Env Vars
*Some apps have these...*

In your Dokku server run

```bash
dokku config django-tutorial
```

to see a list of all of your current environment variables.

**To set a new one:**

```bash
dokku config:set django-tutorial MY_VAR=my-value
```

## In Conclusion

I hope this was helpful. Dokku is cool. I'm gonna get my $7 back from
Heroku now. :peace:
