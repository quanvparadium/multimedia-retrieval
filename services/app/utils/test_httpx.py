payload = {
    "file_path": "../app/data/images_L01/L01_V001/000804.jpg"    
}  # Chuyển đổi dữ liệu thành dictionary
import httpx
async def call():
    async with httpx.AsyncClient() as client:
        response = await client.post("http://localhost:4002/ocr", json=payload)
        return response.json()

async def main():
    result = await call()
    return result

if __name__ == "__main__":
    import asyncio
    print(asyncio.run(main()))