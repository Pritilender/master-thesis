#!/bin/zsh

kubectl run -it --rm --restart=Never artillery-admin \
  --image=miksamixa/artillery:v1 \
  -- run admin.yml & \
  kubectl run -it --rm --restart=Never artillery-messages \
  --image=miksamixa/artillery:v1 \
  -- run messages.yml &
  kubectl run -it --rm --restart=Never artillery-rides \
  --image=miksamixa/artillery:v1 \
  -- run rides.yml & \
  wait