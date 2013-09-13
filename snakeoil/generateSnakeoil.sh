#!/usr/bin/env bash
openssl genrsa -out privkey.pem
openssl req -new -key privkey.pem -out cert.csr
openssl req -new -x509 -key privkey.pem -out cert.pem -days 1095
