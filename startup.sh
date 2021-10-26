#!/bin/sh

cp .env.example .env

sed -i 's|${API_PORT)|'$API_PORT'|' .env
sed -i 's|${COMPANY_CODE_VA)|'$COMPANY_CODE_VA'|' .env
sed -i 's|${SUB_COMPANY_CODE_VA)|'$SUB_COMPANY_CODE_VA'|' .env
sed -i 's|${SQL_URI)|'$SQL_URI'|' .env
sed -i 's|${OAUTH_SERVER_TOKEN_VALIDATION)|'$OAUTH_SERVER_TOKEN_VALIDATION'|' .env
sed -i 's|${SECRET)|'$SECRET'|' .env

node index.js