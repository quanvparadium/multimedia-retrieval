from fastapi import APIRouter



@documentPreprocessRouter.post('/')
def extract_keyframe(item: Item):
    # print("Processing document ...")
    # assert item.type == "document", "File must be a document"
    
    result = {
        "message": "Document process done!"
    }
    # result = DocumentPreprocessing.extract_keyframe(int(item.id))
    return result