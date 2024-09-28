from typing import List

def get_result(kf):
    return {
        "file_id": kf.file_id,
        "byte_offset": kf.byte_offset,
        "keyframeId": kf.id,
        "cosine_score": kf.distance,
        "frame_number": kf.frame_number,
        "frame_second": kf.frame_second
    }

def cosine_score(kf: dict):
    if "cosine_score" in kf.keys():
        return kf['cosine_score']
    else:
        return 1.01

def kw_score(kf):
    return kf['TF_IDF_score']

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


def remove_ensemble_ranker(array: List[dict]):
    from copy import deepcopy
    new_data = deepcopy(array)
    # Xoá key 'rank_score' khỏi từng dictionary trong list
    for item in new_data:
        item.pop("Rank_score", None)
    return new_data