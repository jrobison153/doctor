#!/usr/bin/env bash

docker run -d -p 8082:8082\
            -e DOCTOR_DB_NAME=systemintegration \
            -e DOCTOR_DB_HOST=docker.for.mac.localhost \
            -e DOCTOR_DB_PORT=27017 \
            doctor