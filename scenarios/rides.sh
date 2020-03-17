#!/bin/zsh

kubectl run -it --rm --restart=Never artillery-rides \
  --image=miksamixa/artillery:latest \
  -- run rides.yml