# Retrieval System Python Services
<style>
r { color: Red }
o { color: Orange }
g { color: Green }
bold { font-weight: bold }
</style>
## 1. Download resources

- **Download** database ở link dưới đây: **[Database](https://drive.google.com/file/d/1cYJObNmvmBe0RHZltgOGL_6X1Gga6v4v/view?usp=drive_link)**, sau đó giải nén và để trong thư mục **services**. 
- Sau đó download thêm 3 file chứa features của video và chuyển vô thư mục **features** (nếu chưa có, hãy tạo nó):
    - [feature_blip_cosine.bin](https://drive.google.com/file/d/1qH22Wrs0gXmgQccxR8tTgOw2eEnXtO8w/view?usp=sharing)
    - [keyframe_id.json](https://drive.google.com/file/d/1K9uVxI7dPIJw44Hf7Gu_TnBa5G2Zqiz5/view?usp=drive_link)
    - [keyframe_id2path.json](https://drive.google.com/file/d/1gxtm7pSLLwK3EhAVkniBD_PQCq-ZUGeV/view?usp=drive_link) 
- **Cấu trúc thư mục** sẽ có dạng như sau:

        .
        ├── ...
        ├── fe                      # front folder
        ├── be-express              # Backend folder
        │   ├── uploads             # If you upload video (or image), file will be in here
        │   ├── ...          
        ├── services                        # Python services folder
        │   ├── Database                    # Original database (contain documents, images and videos)
        │   ├── features                    # Extracted features folder
        │   │   ├── faiss_blip_cosine.bin   # Binary file contain feature
        │   │   ├── keyframe_id.json        
        │   │   └── keyframe_id2path.json       
        │   ├── .env                        # contains PORT, HOST, FRONTEND_PORT
        │   └── ...                    
        └── ...

## 2. Setup environment
### 2.1. Install conda
First you should install **conda**. In order to do so execute the commands below:

```bash
$ wget -c https://repo.continuum.io/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh
# on MacOS replace with:
# wget -c https://repo.continuum.io/miniconda/Miniconda3-latest-MacOSX-x86_64.sh -O miniconda.sh
$ bash ./miniconda.sh -b -f -p /path/to/conda
$ export PATH="/path/to/conda/bin:$PATH"
$ source activate base
```

Here `/path/to/conda` should be the path where you want to install conda. You can choose it in your home so that you will have write permission to it.

### 2.2. Setup environment

You should use Python 3.7 <= 3.xx < 3.10
We recommended using **Python 3.9** for our app
- **Conda** (<r><bold>Recommended</bold></r>): 

    ```bash
    $ conda create -n lavis python=3.9 anaconda
    $ conda activate lavis
    ```
    To leave the environment after you no longer need it: 
    ```bash
    $ conda deactivate
    ```
    How to check the packages whether available in current channels: 
        https://conda.anaconda.org/conda-forge/osx-arm64/
- **Mac/Linux Users** (<o>if you don't use conda</o>):
    ```bash
    $ python -m pip install --user --upgrade pip
    $ python -m pip install --user virtualenv
    $ python -m venv venv
    ```
    To activate the virtual environment:
    ```bash
    source venv/bin/activate
    ```
    To leave the environment after you no longer need it: 
    ```bash
    $ deactivate
    ```
### 2.3. Install package
#### Không sử dụng Docker 
Vui lòng activate môi trường <bold>lavis</bold> để có thể cài đặt các thư viện cần thiết
```bash
$ cd services
$ conda activate lavis

# Clone model repos
$ git clone https://github.com/quanvparadium/LAVIS.git
$ cd LAVIS
$ pip install -e .

$ cd ..
$ pwd # ..../services

# Install backend package Fastapi
$ pip install -r requirements.txt
$ pip install -r postenv.txt
$ export PYTHONPATH=./LAVIS
$ python app.py
```
Nếu sử dụng môi trường MacOS, vui lòng chạy "brew install postgis" để kích hoạt pgvector extension
Nếu sử dụng môi trường Linux, vui lòng chạy "apt-get install postgis*" để kích hoạt pgvector extension

Vui lòng đọc kĩ cài đặt Pgvector ở đây: github.com/pgvector/pgvector#missing-header

## Cài dặt pg extension, giả định đã có postgresql@15 trên máy

```bash
$ pwd
/Users/admin/..../services

$ mkdir repo
$ cd repo
$ git clone --branch v0.7.2 https://github.com/pgvector/pgvector.git
$ cd pgvector

$ export PG_CONFIG=/opt/homebrew/opt/postgresql@15/bin/pg_config
$ sudo --preserve-env=PG_CONFIG make install                    

$ psql postgres
postgres=# CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION
postgres=# \q
```

#### Sử dụng Docker (Chưa hoàn thành)
```bash
$ docker compose up
$ python app.py
```


