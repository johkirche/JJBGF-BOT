FROM keymetrics/pm2:latest-alpine

# Bundle APP files
COPY src src/
COPY package.json .
COPY yarn.lock .
COPY pm2.json .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN yarn install --production

# Show current folder structure in logs
# RUN ls -al -R
RUN pwd
CMD [ "pm2-runtime", "start", "pm2.json"]