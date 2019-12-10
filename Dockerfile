FROM node:10-alpine AS builder
# set working directory
WORKDIR /app

# install and cache app dependencies
COPY ./package*.json ./
RUN npm install
COPY ./ ./

# build the angular app
RUN npm run build

FROM nginx:alpine
# configure ports and listeners with custom nginx.conf
RUN rm /etc/nginx/conf.d/default.conf
ADD default.conf /etc/nginx/conf.d/

# copy from dist to nginx root dir
COPY --from=builder /app/build/ /usr/share/nginx/html
COPY --from=builder /app/build/ /etc/nginx/html
#RUN echo 'http://mirrors.ustc.edu.cn/alpine/v3.9/main/' > '/etc/apk/repositories' && \
#    echo 'http://mirrors.ustc.edu.cn/alpine/v3.9/community/' >> '/etc/apk/repositories' && \
RUN echo 'http://mirrors.aliyun.com/alpine/v3.9/main/' > '/etc/apk/repositories' && \
    echo 'http://mirrors.aliyun.com/alpine/v3.9/community/' >> '/etc/apk/repositories' && \
    apk update && \
    apk add --no-cache openssh && \
    apk add --no-cache sudo && \
    apk add --no-cache openrc && \
    echo 'Port 30125' >> /etc/ssh/sshd_config  && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    sed -i "s/#PermitRootLogin.*/PermitRootLogin yes/g" /etc/ssh/sshd_config && \
    ssh-keygen -t rsa -P "" -f /etc/ssh/ssh_host_rsa_key && \
    ssh-keygen -t ecdsa -P "" -f /etc/ssh/ssh_host_ecdsa_key && \
    ssh-keygen -t ed25519 -P "" -f /etc/ssh/ssh_host_ed25519_key && \
    echo -e "apulis2019\napulis2019" | passwd root
ADD start.sh /

RUN chmod +x /start.sh

# expose port 6501 30122
EXPOSE 6601 30125

# set author info
LABEL maintainer="maesinfo"

# run nginx in foreground
ENTRYPOINT ./start.sh

