print("\033[33mLoading OCR model ...\033[0m")
import easyocr
EASY_OCR = easyocr.Reader(['en'], gpu=True)
# print(EASY_OCR.readtext("./data/images_L01/L01_V001/000804.jpg"))
print("\033[32mLoaded OCR model successfully! \033[0m")