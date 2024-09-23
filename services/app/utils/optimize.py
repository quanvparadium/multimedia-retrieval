from scipy.stats import spearmanr
import numpy as np

# Hàm tính Spearman Rank Correlation
def spearman_correlation(predicted, target):
    return spearmanr(predicted, target)[0]  # Trả về hệ số tương quan

# Hàm tính ensemble ranking như trước
def ensemble_ranking(weight, semantic_results, ocr_results):
    semantic_ranks = [(doc, 1 / (rank + 1)) for rank, doc in enumerate(semantic_results)]
    ocr_ranks = [(doc, 1 / (rank + 1)) for rank, doc in enumerate(ocr_results)]
    
    combined_ranks = []
    
    for doc, semantic_score in semantic_ranks:
        ocr_score = 0
        for ocr_doc, ocr_r in ocr_ranks:
            if doc == ocr_doc:
                ocr_score = ocr_r
                break
        ensemble_score = semantic_score * weight + ocr_score * (1 - weight)
        combined_ranks.append((doc, ensemble_score))
    
    for doc, ocr_score in ocr_ranks:
        if doc not in [doc for doc, _ in semantic_ranks]:
            ensemble_score = ocr_score * (1 - weight)
            combined_ranks.append((doc, ensemble_score))
    
    combined_ranks.sort(key=lambda x: x[1], reverse=True)
    return [doc for doc, score in combined_ranks]

# Hàm tối ưu hóa weight
def find_optimal_weight(semantic_list, ocr_list, target_list):
    best_weight = 0
    best_score = -1
    
    # Duyệt qua các giá trị weight từ 0 đến 1 với bước 0.01
    for weight in np.arange(0, 1.01, 0.01):
        total_score = 0
        
        # Duyệt qua các ví dụ
        for semantic_results, ocr_results, target_results in zip(semantic_list, ocr_list, target_list):
            predicted_results = ensemble_ranking(weight, semantic_results, ocr_results)
            
            # Tính độ tương đồng với target bằng Spearman correlation
            score = spearman_correlation(predicted_results, target_results)
            total_score += score
        
        avg_score = total_score / len(semantic_list)
        
        # Lưu lại weight tốt nhất
        if avg_score > best_score:
            best_score = avg_score
            best_weight = weight
    
    return best_weight, best_score

# Ví dụ sử dụng
semantic_list = [
    ['doc1', 'doc2', 'doc3'],
    ['doc1', 'doc3', 'doc5'],
    ['doc2', 'doc4', 'doc6']
]
ocr_list = [
    ['doc3', 'doc4'],
    ['doc2', 'doc5'],
    ['doc6', 'doc1']
]
target_list = [
    ['doc3', 'doc1', 'doc4', 'doc2'],
    ['doc5', 'doc2', 'doc1', 'doc3'],
    ['doc6', 'doc1', 'doc2', 'doc4']
]

optimal_weight, optimal_score = find_optimal_weight(semantic_list, ocr_list, target_list)
print(f"Optimal Weight: {optimal_weight}, Optimal Score: {optimal_score}")
