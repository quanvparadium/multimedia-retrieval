import Image from "next/image";
import Layout from "../components/Layout";
import { FormEvent } from 'react';
export default function Home() {
  return (
    <Layout>
      <div className="h-1/4 vh-3/4 p-4">
        <form className="w-full bg-indigo-50 rounded-3xl p-6" 
          onClick = {() => {console.log('form')}}
          onSubmit={(e) => e.preventDefault()}
          >
                
            <div className="flex items-center mb-2">
                <input type="text" name="search" placeholder="Input your query" autoComplete="off" aria-label="Search talk" 
                    className="w-3/4 pr-3 pl-10 py-2 font-semibold placeholder-gray-500 text-black rounded-2xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"
                />  
      
                <div className="flex items-center ml-2">
                    <label htmlFor="typedata" className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-[90px] required">Type data<span className="text-red-500">*</span> :</label>
                    <select id="typedata" defaultValue={"Image"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>                              
                </div>
            </div>      

            <div className="flex items-center mb-2">
                <div className="flex items-center ml-2 w-1/3">
                    <label htmlFor="typedata" className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-10 required">OCR :</label>
                    {/* <select id="typedata" defaultValue={"Image"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>        */}
                    <input id="typedata" type="text" placeholder="Ex. VN Airline, stop, ..." name="ocr" autoComplete="off" aria-label="OCRSearch"
                    className="w-full ml-2 px-3 py-2 font-semibold text-sm placeholder-gray-500 text-black rounded-xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"></input>

                </div>

                <div className="flex items-center ml-2">
                    <label htmlFor="typedata" className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-[90px] required">Type data<span className="text-red-500">*</span> :</label>
                    <select id="typedata" defaultValue={"Image"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>                              
                </div>                
            </div>

            <div className="flex items-center mb-2">
                <div className="flex items-center ml-2 w-1/3">
                    <label htmlFor="typedata" className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-10 required">OCR :</label>
                    {/* <select id="typedata" defaultValue={"Image"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>        */}
                    <input id="typedata" type="text" placeholder="Ex. VN Airline, stop, ..." name="ocr" autoComplete="off" aria-label="OCRSearch"
                    className="w-full ml-2 px-3 py-2 font-semibold text-sm placeholder-gray-500 text-black rounded-xl border-none ring-2 ring-gray-300 focus:ring-gray-500 focus:ring-2"></input>

                </div>

                <div className="flex items-center ml-2">
                    <label htmlFor="typedata" className="block text-sm ml-1 font-semibold text-gray-900 dark:text-white min-w-[90px] required">Type data<span className="text-red-500">*</span> :</label>
                    <select id="typedata" defaultValue={"Image"} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm font-bold text-center rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                      <option value="document">Document</option>
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>                              
                </div>                
            </div>                                      
            
          </form>
        
      </div>
    </Layout>
  );
}
