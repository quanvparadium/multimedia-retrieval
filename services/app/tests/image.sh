#!/bin/bash

# Đường dẫn đến folder chứa các thư mục con
base_dir="./data/images_L01"

# URL của API
api_url="http://localhost:4000/api/preprocessing/image"

# Duyệt qua từng thư mục con trong folder base_dir
for subdir in "$base_dir"/*; do
    # Kiểm tra xem thư mục con có thực sự là thư mục không
    if [ -d "$subdir" ]; then
        # Lấy tên thư mục con (ví dụ: L01_V001)
        folder_name=$(basename "$subdir")

        # Duyệt qua từng file trong thư mục con
        for img_file in "$subdir"/*; do
            # Kiểm tra xem file có thực sự là file không
            if [ -f "$img_file" ]; then
                # Lấy tên file và phần mở rộng (ví dụ: 000804.jpg)
                file_name=$(basename "$img_file")
                file_extension="${file_name##*.}"
                file_id="${folder_name}_${file_name%.*}"

                # Gửi yêu cầu curl
                curl --location "$api_url" \
                --header 'Content-Type: application/json' \
                --data "{
                    \"file_id\": \"$file_id\",
                    \"user_id\": \"1\",
                    \"format\": \"$file_extension\",
                    \"store\": \"local\",
                    \"file_path\": \"$img_file\"
                }"
            fi
        done
    fi
done
