FROM node:10.5.0

# WORKDIR /opt/app

# Install yarn from the local .tgz
# RUN mkdir -p /opt
# ADD latest.tar.gz /opt/
# ENV PATH "$PATH:/opt/yarn/bin"

WORKDIR /home/app

# Install packages using Yarn
ADD ./server/package.json ./server/yarn.lock ./
RUN cd ./ && yarn