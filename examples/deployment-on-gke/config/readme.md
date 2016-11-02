This folder is for your GKE deployment configuration files.

http://kubernetes.io/docs/user-guide/managing-deployments/

# Deploying config files

```bash
npm run deploy -- --deployment=wordpress
```

# Best practices
- Inside the `config/` folder there should be a subfolder for each repo in `source/`
- Inside the `config/repo/` folder there should be a YAML file for each container in `source/repo/containers/`

```md
- config/hello-node/server.yml
- source/hello-node/containers/server/Dockerfile
```

# Process
1. Clone the source files: `npm run clone`
1. Build the docker image: `npm run build`
1. Push the container to the registry: `npm run push`
1. Deploy the container to the cluster: `npm run deploy`
