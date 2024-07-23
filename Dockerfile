# Dockerfile 镜像构建
FROM nginx
# 指定工作目录
WORKDIR /usr/share/nginx/html/
USER root
# 复制nginx配置文件到nginx中
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
# 复制项目打包文件到nginx中
COPY ./dist /usr/share/nginx/html/
# 暴露端口
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]