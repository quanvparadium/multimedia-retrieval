import os

from fastapi import APIRouter
# from .services import VideoPreprocessing
from dotenv import load_dotenv
load_dotenv()
import warnings
warnings.filterwarnings("ignore")

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders.text import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import PGVector
# from langchain_community.chains import PebbloRetrievalQA
from langchain.chains.retrieval_qa.base import RetrievalQA
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

# DECLARE VARIABLE
host= os.environ['POSTGRES_HOST']
port= os.environ['POSTGRES_PORT']
user= os.environ['POSTGRES_USER']
password= os.environ['POSTGRES_PASSWORD']
dbname= os.environ['POSTGRES_DB']
GOOGLE_API_KEY=os.environ.get('GOOGLE_API_KEY')
CONNECTION_STRING = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"

documentPreprocessRouter = APIRouter()

from pydantic import BaseModel
class DocumentItem(BaseModel):
    user_id: str
    format: str # TextLoader for .txt, PDFLoader for .pdf, ...
    store: str
    type: str
    file_path: str
    file_id: str
    
@documentPreprocessRouter.get('/')
def print_content():
    return {
        "message": "Test document successfully!"
    }


@documentPreprocessRouter.post('/')
def extract_keyframe(item: DocumentItem):
    # print("Processing document ...")
    # assert item.type == "document", "File must be a document"
    
    result = {
        "message": "Document process done!"
    }
    # result = DocumentPreprocessing.extract_keyframe(int(item.id))
    return result