FROM node:6-onbuild

WORKDIR /src

# Copy app source
COPY . /src

# Install packages
RUN apt-get update && \
 apt-get install -y net-tools && \
 apt-get clean && \
 rm -rf /var/lib/apt/lists/*

# Install dev dependencies
RUN npm install; npm install -g bunyan

# Global config environment variable

ENV URL_BASE ''
ENV RABBITMQ_HOST ''
ENV RABBITMQ_PASSWORD ''
ENV RABBITMQ_FORCE_CONNECT true
ENV RABBITMQ_HEARTBEAT 30
ENV RABBITMQ_PORT ''
ENV RABBITMQ_USERNAME ''
ENV CREDENTIALS_CLIENT_ID ''
ENV CREDENTIALS_CLIENT_SECRET ''
ENV CREDENTIALS_SCOPES ''
ENV CREDENTIALS_USERNAME ''
ENV CREDENTIALS_USERPASSWORD ''
ENV CREDENTIALS_USERSCOPES ''
ENV LOG_LEVEL debug
ENV PORT 3000
ENV REDIS_HOST 'localhost'
ENV REDIS_PORT 6379
ENV REDIS_USER ''
ENV REDIS_PASSWORD ''
ENV REDIS_DB ''
ENV MONGO_HOST ''
ENV MONGO_USER ''
ENV MONGO_PASSWORD ''

# Expose port
EXPOSE $PORT

# Enable corbel-composr
CMD npm start
