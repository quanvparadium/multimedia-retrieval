# Sử dụng base image chứa Python 3.8 và Conda
FROM continuumio/miniconda3:latest

RUN apt-get update -y && apt-get install -y gcc
RUN apt-get update && apt-get install -y git

# Setting the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

RUN conda env remove -n lavis

# Tạo môi trường ảo Conda với Python 3.8
RUN conda env create -f environment.yml


# Kích hoạt môi trường conda
SHELL ["conda", "run", "-n", "lavis", "/bin/bash", "-c"]

RUN pip install -r requirements.txt

RUN git clone https://github.com/quanvparadium/LAVIS.git

# Di chuyển vào thư mục LAVIS
WORKDIR /app/LAVIS

RUN pip install --upgrade pip setuptools wheel

RUN pip install --default-timeout=500 future 
# Cài đặt các dependencies của LAVIS bằng pip
RUN pip install -e .

WORKDIR /app

RUN pip install -r requirements.txt

RUN pip install fastapi
EXPOSE 4001

CMD ["python", "app.py"]




