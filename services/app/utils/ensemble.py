def ensemble_ranking(semantic_results, ocr_results):
    # Nếu danh sách kết quả OCR rỗng, trả về rỗng
    if not ocr_results:
        return []

    # Kết hợp danh sách kết quả
    combined_results = {result: 'semantic' for result in semantic_results}
    
    # Gán trọng số cho các kết quả từ OCR
    for rank, result in enumerate(ocr_results):
        combined_results[result] = ('ocr', rank + 1)

    # Tạo danh sách mới với điểm số
    ranked_results = []
    for result, source in combined_results.items():
        if source == 'semantic':
            ranked_results.append((result, 0))  # Trọng số cho semantic
        else:
            ranked_results.append((result, source[1]))  # Trọng số cho OCR

    # Sắp xếp theo điểm số
    ranked_results.sort(key=lambda x: x[1])

    # Trả về danh sách kết quả xếp hạng
    return [result for result, score in ranked_results]

# Ví dụ sử dụng
weight = 0.3
semantic_results = [
    {
        "ID": 'doc1' ,
        "Address: ": "doc1.py"
    },
    {
        "ID": 'doc2' ,
        "Address: ": "doc2.py"
    },
    {
        "ID": 'doc3',
        "Address: ": "doc3.py"
    }
]
ocr_results = [
    { 
        "ID": 'doc3',
        "IF_IDF score: ": 0.6  
    },
    { 
        "ID": 'doc4',
        "IF_IDF score: ": 0.3 
        
    }
]
# [1, 1/2, 1/3]
# # [1, 1/2]
# doc3 = 1/3 * weight + 1* (1-a) = 0.8
# doc4 = 0 + 1/2 * 0.7 = 0.35
# doc1 = 1 * 0.3 = 0.3
# doc2 = 1/2 * 0.3 + 0 = 0.15

def ensemble_ranking(ranker_one, ranker_two, weight = 0.3):
    def reciprocal_rank(array):
        return [1.0/(i+1) for i in range(len(array))]
    # rr_r1 = reciprocal_rank(ranker_one)
    # rr_r2 = reciprocal_rank(ranker_two)
    
    result = dict({})
    rr_ranker_one = reciprocal_rank(ranker_one)
    rr_ranker_two = reciprocal_rank(ranker_two)
    
    for idx, doc in enumerate(ranker_one):
        id_doc = doc["ID"]
        
        if id_doc not in result:
            result[id_doc] = rr_ranker_one[idx] * weight
        else:
            print("\033[91m>>> Please check again ranker one!")
            result[id_doc] += rr_ranker_one[idx] * weight
        
    for idx, doc in enumerate(ranker_two):
        id_doc = doc["ID"]
        
        if id_doc not in result:
            result[id_doc] = rr_ranker_two[idx] * (1 - weight)
        else:
            result[id_doc] += rr_ranker_two[idx] * (1 - weight)
    
    ensemble_ranker = [*ranker_one, *ranker_two]
    def ensemble_score(doc):
        return result[doc["ID"]]
    
    return {
        "message": "success",
        "data": sorted(ensemble_ranker, key=ensemble_score)
    }    
    return {
        "message": "success",
        "data": result
    }    
    print(reciprocal_rank(r1))
    print(reciprocal_rank(r2))
    
# def ensemble_ranking(semantic_results, ocr_results, weight = 0.3):
#     # Tạo danh sách reciprocal rank cho semantic_results
#     semantic_ranks = [(doc, 1 / (rank + 1)) for rank, doc in enumerate(semantic_results)]
    
#     # Tạo danh sách reciprocal rank cho ocr_results
#     ocr_ranks = [(doc, 1 / (rank + 1)) for rank, doc in enumerate(ocr_results)]
    
#     # Danh sách chứa tất cả các docs và ensemble score
#     combined_ranks = []
    
#     # Xử lý các docs trong semantic_results
#     for doc, semantic_score in semantic_ranks:
#         ocr_score = 0
#         # Kiểm tra nếu doc cũng có trong ocr_results
#         for ocr_doc, ocr_r in ocr_ranks:
#             if doc == ocr_doc:
#                 ocr_score = ocr_r
#                 break
#         # Tính ensemble score
#         ensemble_score = semantic_score * weight + ocr_score * (1 - weight)
#         combined_ranks.append((doc, ensemble_score))
    
#     # Xử lý các docs chỉ có trong ocr_results
#     for doc, ocr_score in ocr_ranks:
#         if doc not in [doc for doc, _ in semantic_ranks]:  # Kiểm tra nếu doc không có trong semantic_results
#             # Ensemble score chỉ từ ocr_results
#             ensemble_score = ocr_score * (1 - weight)
#             combined_ranks.append((doc, ensemble_score))
    
#     # Sắp xếp danh sách theo ensemble score từ cao đến thấp
#     combined_ranks.sort(key=lambda x: x[1], reverse=True)
    
#     # Trả về danh sách các tài liệu theo thứ tự
#     return [doc for doc, score in combined_ranks]

# # Ví dụ sử dụng
# weight = 0.3
# semantic_results = ['doc1', 'doc2', 'doc3']
# ocr_results = ['doc3', 'doc4']


# ranked_docs = ensemble_ranking(semantic_results, ocr_results, weight=0.8)
# print(ranked_docs)



ensemble = ensemble_ranking(semantic_results, ocr_results)
print(ensemble)  # Kết quả xếp hạng


# Khai báo hai danh sách ban đầu
semantic_results = [
    {
        "ID": 'doc1',
        "Address: ": "doc1.py"
    },
    {
        "ID": 'doc2',
        "Address: ": "doc2.py"
    },
    {
        "ID": 'doc3',
        "Address: ": "doc3.py"
    }
]

ocr_results = [
    {
        "ID": 'doc3',
        "Address: ": "doc4.py",
        "IF_IDF score: ": 0.6
    },
    {
        "ID": 'doc4',
        "IF_IDF score: ": 0.3
    }
]

# Tạo dictionary tạm để merge dựa trên key "ID"
merged_dict = {}

# Duyệt qua semantic_results và thêm vào dictionary tạm
for item in semantic_results:
    id_key = item['ID']
    merged_dict[id_key] = item  # Thêm từng item theo ID

# Duyệt qua ocr_results và merge các giá trị
for item in ocr_results:
    id_key = item['ID']
    if id_key in merged_dict:
        # Nếu ID đã tồn tại, merge các key từ ocr_results vào
        merged_dict[id_key].update(item)
    else:
        # Nếu ID chưa tồn tại, thêm mới vào dictionary
        merged_dict[id_key] = item

# Chuyển dictionary tạm về list nếu cần
merged_results = list(merged_dict.values())

# Kết quả
print("=="*25)
# print(merged_results)
for res in merged_results:
    print(res)

from typing import List
def get_rank(array: List[object]):
    # Mảng đầu vào phải tăng dần
    current_rank = 1
    result = []
    if len(array) < 1:
        return None
    else:
        current_value = array[0]
        for i in range(len(array)):
            if array[i] == current_value:
                result.append(current_rank)
            elif array[i] > current_value:
                current_rank += 1
                current_value = array[i]
                result.append(current_rank)
            else:
                raise Exception("Array must be cumulative")
        return result
    
array = [0.3, 0.3, 0.5, 0.5, 0.6, 0.7, 0.8, 0.8, 0.8, 0.8, 0.9]
print(get_rank(array))

data = [
    {
        "ID": "doc1",
        "Address": "doc1.py",
        "rank_score": 0.9
    },
    {
        "ID": "doc2",
        "Address": "doc2.py",
        "rank_score": 0.7
    },
    {
        "ID": "doc3",
        "Address": "doc3.py",
        "rank_score": 0.5
    }
]

from copy import deepcopy
new_data = deepcopy(data)
# Xoá key 'rank_score' khỏi từng dictionary trong list
for item in new_data:
    item.pop("rank_score", None)  # None để tránh lỗi nếu key không tồn tại

print(data)
print(new_data)
