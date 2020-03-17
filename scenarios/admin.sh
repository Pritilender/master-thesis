#!/bin/zsh

kubectl run -it --rm --restart=Never artillery-admin \
  --image=miksamixa/artillery:latest \
  -- run admin.yml