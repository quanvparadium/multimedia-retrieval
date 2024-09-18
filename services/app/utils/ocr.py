#pip install vietocr
#pip install easyocr


import easyocr
img = '../data/NBCNews/keyframes/NBC_06092024/NBC_06092024_4387.jpg'
img = '../data/NBCNews/keyframes/NBC_06092024/NBC_06092024_3621.jpg'

reader = easyocr.Reader(['en']) # this needs to run only once to load the model into memory
result = reader.readtext(img, detail = 0)
print(result)
print("Length: ", len(result))

# import matplotlib.pyplot as plt
# from PIL import Image

# from vietocr.tool.predictor import Predictor
# from vietocr.tool.config import Cfg

# config = Cfg.load_config_from_name('vgg_transformer')
# # config['weights'] = './weights/transformerocr.pth'
# config['cnn']['pretrained']=True
# config['device'] = 'cpu'
# detector = Predictor(config)

# # img = './sample/031189003299.jpeg'
# img = '../data/images_L01/L01_V023/001364.jpg'
# img = Image.open(img)
# # plt.imshow(img)
# s = detector.predict(img)
# print(s)