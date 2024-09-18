FROM python:3.9-slim

WORKDIR /code

COPY . /code
# WORKDIR /code/
# RUN python install.py
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y

RUN apt-get update && apt-get install -y git && apt-get install -y libhdf5-dev
RUN apt update \
    && apt install -y libmariadb-dev \
        gcc \
        curl \
        linux-headers-generic \
        python3-dev \
        libcogl-pango-dev \
        libcairo2-dev \
        libtool \
        musl-dev \
        libffi-dev \
        libssl-dev \
        libjpeg-dev \
        zlib1g-dev

WORKDIR /code/repo/LAVIS

# RUN pip install --no-binary h5py h5py
RUN pip install -e .

WORKDIR /code
RUN python3 install.py

WORKDIR /code/install
RUN pip install -r requirements.txt
RUN pip install -r postenv.txt



WORKDIR /code/app

EXPOSE 4000
CMD ["pytest tests/test_image.py"]