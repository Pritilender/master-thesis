#!/bin/zsh

kubectl run -it --rm --restart=Never artillery-messages \
  --image=miksamixa/artillery:latest \
  -- run messages.yml