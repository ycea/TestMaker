This is just another site to create tests. Not localized unluckily.  
**How to run**  
to run this project you just simply need a docker, docker-compose and npm (optional)
You can run 
```bash
npm run build
```
Then go to docker directory and then 
```bash
docker-compose up --build
```
If you have no npm on your host machine then you can run 
```bash
docker exec -it testMaker-app bash
npm run build
```
