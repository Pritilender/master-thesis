#!/bin/bash

artillery run admin.yml -o reports/$1-admin.json & \
  artillery run messages.yml -o reports/$1-messages.json & \
  artillery run rides.yml -o reports/$1-rides.json &
  wait
