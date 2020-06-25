#!/bin/bash

# # build docker images and push them to the Docker registry
cd api-gateway
docker build -t miksamixa/foober-api-gateway:v1 .
docker push miksamixa/foober-api-gateway:v1

cd ../telematics
docker build -t miksamixa/foober-telematics:v3 .
docker push miksamixa/foober-telematics:v3

cd ../vehicles
docker build -t miksamixa/foober-vehicles:v6 .
docker push miksamixa/foober-vehicles:v6

cd ../rides
docker build -t miksamixa/foober-rides:v5 .
docker push miksamixa/foober-rides:v5

# # create a K8S cluster on GKE
cd ..
# # gcloud container clusters create foober --num-nodes 4 --machine-type n1-standard-2 --zone europe-west3
# # gcloud beta compute ssl-certificates create foober --domains DOMAIN_1,DOMAIN_2 --description DESC

helm install nats stable/nats -f api-gateway/k8s/nats-config.yml
helm install telematics-db stable/mongodb-replicaset -f telematics/k8s/mongo-config.yml
helm install vehicles-db bitnami/postgresql-ha -f vehicles/k8s/postgres-ha-config.yml
helm install rides-db bitnami/postgresql-ha -f rides/k8s/postgres-ha-config.yml
helm install metrics stable/prometheus-operator -f prometheus.yaml
helm install adapter stable/prometheus-adapter -f adapter.yaml

kubectl apply -f api-gateway/k8s/deployment.yaml
kubectl apply -f api-gateway/k8s/service.yaml
kubectl apply -f api-gateway/k8s/service-monitor.yaml
kubectl apply -f api-gateway/k8s/autoscaler.yaml
kubectl apply -f api-gateway/k8s/ingress.yaml

kubectl apply -f telematics/k8s/deployment.yaml
kubectl apply -f telematics/k8s/service.yaml
kubectl apply -f telematics/k8s/service-monitor.yaml
kubectl apply -f telematics/k8s/autoscaler.yaml

kubectl apply -f vehicles/k8s/deployment.yaml
kubectl apply -f vehicles/k8s/service.yaml
kubectl apply -f vehicles/k8s/service-monitor.yaml
kubectl apply -f vehicles/k8s/autoscaler.yaml

kubectl apply -f rides/k8s/deployment.yaml
kubectl apply -f rides/k8s/service.yaml
kubectl apply -f rides/k8s/service-monitor.yaml
kubectl apply -f rides/k8s/autoscaler.yaml