#!/bin/sh

remote_address="ec2-54-93-179-229.eu-central-1.compute.amazonaws.com"
local_image_name="a9e/redash"
remote_image_scope="public.ecr.aws/l5l8e4q8"
remote_image_name="$remote_image_scope/redash"
version=$(docker images | awk '($1 == "a9e/redash") {print $2 += .1; exit}')

# authenticate docker with aws details
aws ecr-public get-login-password --region us-east-1 --profile "$AWS_PROFILE" | docker login --username AWS --password-stdin $remote_image_scope

docker build --platform=linux/amd64 -t "$local_image_name:$version" .
docker tag $local_image_name:"$version" $remote_image_name:latest

docker push $remote_image_name:"$version"
docker push $remote_image_name:latest

ssh -i deploy-keys.pem -T ubuntu@$remote_address <<'EOL'
	cd /opt/redash
	sudo docker image pull public.ecr.aws/l5l8e4q8/redash:latest
	sudo docker-compose down
	sudo docker-compose up -d
EOL