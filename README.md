# log-client

show remote log. work with [log-server](https://github.com/andych008/log-server)

logcat --> log-server --> log-client 

## Build as desktop application
- setup
```
# windows
npm install --save-dev electron-installer-windows
# debian
npm install --save-dev electron-installer-debian
```


- run
```
npm install
npm run start
```

- build to ./dist as desktop application
```
npm install

# windows
npm run build

# ubuntu
npm run build2
```

## Build as crx
chrome --> extensions --> Pack extension
