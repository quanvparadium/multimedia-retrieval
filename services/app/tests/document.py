import os
from dotenv import load_dotenv
load_dotenv()
GOOGLE_API_KEY=os.getenv('GOOGLE_API_KEY')

import google.generativeai as genai

for model in genai.list_models():
    print(model.name)

genai.configure(api_key=GOOGLE_API_KEY)

import warnings
warnings.filterwarnings("ignore")

from pathlib import Path

import pandas as pd
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.document_loaders.text import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import PGVector
# from langchain_community.chains import PebbloRetrievalQA
from langchain.chains.retrieval_qa.base import RetrievalQA

host= os.environ['POSTGRES_HOST']
port= os.environ['POSTGRES_PORT']
user= os.environ['POSTGRES_USER']
password= os.environ['POSTGRES_PASSWORD']
dbname= os.environ['POSTGRES_DBNAME']

# We use postgresql rather than postgres in the conn string since LangChain uses sqlalchemy under the hood
# You can remove the ?sslmode=require if you have a local PostgreSQL instance running without SSL
CONNECTION_STRING = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"


from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI

# pdf_loader = PyPDFLoader("./content/attention_is_all_you_need.pdf")
# pdf_loader = PyPDFLoader("./content/blip_visionlanguagemodel.pdf")
# pages = pdf_loader.load_and_split()
# print("Page content: ", pages[3].page_content)

text_loader = TextLoader('./content/shb_danang.txt')
pages = text_loader.load_and_split()
print("Page content: ", pages[0].page_content)


text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=1000)
context = "\n\n".join(str(p.page_content) for p in pages)
texts = text_splitter.split_text(context)
print(len(texts))

embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001",google_api_key=GOOGLE_API_KEY)
     
# query_string = "Describe the Multi-head attention layer in detail?"
# embed = embeddings.embed_query(query_string)

print("Postgre Active ...")

model = ChatGoogleGenerativeAI(model="gemini-pro",google_api_key=GOOGLE_API_KEY,
                             temperature=0.2,convert_system_message_to_human=True)
from langchain_community.vectorstores.pgvector import DistanceStrategy

# db = PGVector.from_documents(
#     documents= texts,
#     embedding = embeddings,
#     collection_name= "blog_posts",
#     distance_strategy = DistanceStrategy.COSINE,
#     connection_string=CONNECTION_STRING)
db = PGVector.from_texts(
    texts = texts,
    embedding = embeddings,
    collection_name= "shb_danang",
    distance_strategy = DistanceStrategy.COSINE,
    connection_string=CONNECTION_STRING
)


retriever = db.as_retriever(
    search_kwargs={"k": 3}
    )

qa_chain = RetrievalQA.from_chain_type(
    llm=model,
    # app_name="",
    # description="",
    # owner="Quan",
    retriever=retriever,
    return_source_documents=True
)

# question = "Describe the BLIP model in detail?"
question = "Bà trương mỹ lan bị gì ?"
# question = "Compare BLIP and Attention model"
result = qa_chain.invoke({"query": question})
print(result["result"])

