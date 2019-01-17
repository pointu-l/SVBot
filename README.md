# SVBot
Node.js Subversion (SVN) automatic uping.  

## What
a script for automaticly up svn repo, all 30 minutes, all days for this first version [see roadmap]

## Why
if you need to "fetch" a svn repo all 30 minutes (considered as an "user action" for most organizations like schools for eg ...) then it's made for you ... 😜

## Install & usage instructions
Clone the repo in any directory, then cd to it.  

```bash
    $ npm install
    # Install all dependencies in node_modules
```
  
Open src/index.ts, then :
```
    - change repo path to one of you repo (must be absolute)
    - edit daily planning if necessary
```

Install pm2 :
```bash
    $ sudo npm install -g pm2 
``` 

Launch project using pm2 :
```bash
    $ pm2 start "npm start"
    # Will compile and launch in background
```

Show log :
```bash
    $ pm2 logs <id-or-service-name>
```

Enable pm2 start at server startup :
```bash
    $ pm2 startup
    # then copy paste the generated command
```

## Roadmap
✅ upping a repo all 30 minutes.  
 (50% no up in dead hours) upping only when it's time to (for eg only 3 days in the week).  
⛔ (useless, pm2 do the job) adding a logger.  
⏳ move some things to a config file.  
⏳ gmail send logs (hourly probably, for being sure).  
⏳ add to the config active repos workspace / name.  
⏳ replace actives workspaces list by a recursive search of .svn directories in a specific directory.  
⏳ rotate repos (randomly probably).  
  

⏳ api && maybe other cool things.  
