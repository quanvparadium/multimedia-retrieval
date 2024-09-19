mkdir repo
#git clone git@github.com:quanvparadium/LAVIS.git ./repo/LAVIS
cd repo

#### If you don't have Python 3.10.13 
#### Please run the below command
# pyenv install 3.10.13
# pyenv global 3.10.13
# eval "$(pyenv init --path)"
# python -m venv .venv

# source .venv/bin/activate


### DOCKER COMPOSE
# Make sure you have test_db/test_postgres_db.env

cd ../test_db
docker compose up

cd ..
docker compose up


