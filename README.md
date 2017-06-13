# timbr-volumes
> zfs pool api

## Deploy

```
cd timbr-volumes
nvm use
npm i -g pm2
git pull
npm i
pm2 restart all
```

## Use

#### List
```bash
curl http://10.0.0.10:8000 # GET

# 200
# [{
#   "name":"juno-pool",
#   "used":"408K",
#   "available":"984G",
#   "mountpoint":"/juno-pool",
#   "sharenfs":"off"
# }]
```

#### Create
```bash
curl --data "name=foo&size=2G" http://10.0.0.10:8000/ # POST name and size

# 200
```
#### Delete
```bash
curl --data "name=foo" -X DELETE http://10.0.0.10:8000 # DELETE with name in body

# 200
```
