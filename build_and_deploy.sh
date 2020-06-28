#!/bin/bash

PROJECT_ID=$1
CLUSTER_NAME=$2

# # build docker images and push them to the Docker registry
# cd api-gateway
# docker build -t miksamixa/foober-api-gateway:v1 .
# docker push miksamixa/foober-api-gateway:v1

# cd ../telematics
# docker build -t miksamixa/foober-telematics:v3 .
# docker push miksamixa/foober-telematics:v3

# cd ../vehicles
# docker build -t miksamixa/foober-vehicles:v6 .
# docker push miksamixa/foober-vehicles:v6

# cd ../rides
# docker build -t miksamixa/foober-rides:v5 .
# docker push miksamixa/foober-rides:v5

# create a K8S cluster on GKE
# cd ..
gcloud beta container --project "$PROJECT_ID" clusters create "$CLUSTER_NAME" \
 --zone "europe-west3-a" \
 --no-enable-basic-auth \
 --cluster-version "1.14.10-gke.36" \
 --machine-type "n1-standard-2" \
 --image-type "COS" \
 --disk-type "pd-standard" \
 --disk-size "100" \
 --metadata disable-legacy-endpoints=true \
 --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" \
 --num-nodes "4" \
 --enable-stackdriver-kubernetes \
 --enable-ip-alias \
 --network "projects/$1/global/networks/default" \
 --subnetwork "projects/$1/regions/europe-west3/subnetworks/default" \
 --default-max-pods-per-node "110" \
 --no-enable-master-authorized-networks \
 --addons HorizontalPodAutoscaling,HttpLoadBalancing \
 --enable-autoupgrade \
 --enable-autorepair \
 --max-surge-upgrade 1 \
 --max-unavailable-upgrade 0

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