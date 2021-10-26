FROM node:alpine

RUN apk add tzdata \
    && cp /usr/share/zoneinfo/Asia/Jakarta /etc/localtime \
    && apk del tzdata 

WORKDIR /bca-api
ADD . /bca-api/

RUN npm install

ENV API_PORT=
ENV COMPANY_CODE_VA=
ENV SUB_COMPANY_CODE_VA=
ENV SQL_URI=
ENV OAUTH_SERVER_TOKEN_VALIDATION=
ENV SECRET=

CMD ["./startup.sh"]