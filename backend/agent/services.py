from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import os
from .prompts import review_analyzer_prompt, choose_tool_prompt, clarify_requirements_prompt
import json
from tavily import TavilyClient
import weaviate
import weaviate.classes as wvc
import pandas as pd
import csv
import random
import logging



import json

def read_sf_addresses():
    sf_addresses = [
        {
            "Address": "1234 Market St, SF",
            "Amenities": ["Gym", "Pool", "Parking"],
            "Rental Price": "$3,200",
            "Number of Rooms": 2
        },
        {
            "Address": "5678 Mission St, SF",
            "Amenities": ["Rooftop", "Gym", "Laundry"],
            "Rental Price": "$2,800",
            "Number of Rooms": 1
        },
        {
            "Address": "91011 Pine St, SF",
            "Amenities": ["Laundry", "Garage", "Garden"],
            "Rental Price": "$4,500",
            "Number of Rooms": 3
        },
        {
            "Address": "1213 Castro St, SF",
            "Amenities": ["Gym", "Pet-friendly", "Parking"],
            "Rental Price": "$3,100",
            "Number of Rooms": 1
        },
        {
            "Address": "1415 Hayes St, SF",
            "Amenities": ["Pool", "Rooftop", "Laundry"],
            "Rental Price": "$3,900",
            "Number of Rooms": 2
        },
        {
            "Address": "1617 Folsom St, SF",
            "Amenities": ["Gym", "Parking", "Garden"],
            "Rental Price": "$2,600",
            "Number of Rooms": 1
        },
        {
            "Address": "1819 Lombard St, SF",
            "Amenities": ["Pool", "Laundry", "Rooftop"],
            "Rental Price": "$4,000",
            "Number of Rooms": 2
        },
        {
            "Address": "2021 Divisadero St, SF",
            "Amenities": ["Gym", "Pool", "Pet-friendly"],
            "Rental Price": "$3,700",
            "Number of Rooms": 2
        },
        {
            "Address": "2223 Van Ness Ave, SF",
            "Amenities": ["Laundry", "Parking", "Rooftop"],
            "Rental Price": "$3,300",
            "Number of Rooms": 1
        },
        {
            "Address": "2425 Harrison St, SF",
            "Amenities": ["Garden", "Laundry", "Gym"],
            "Rental Price": "$3,600",
            "Number of Rooms": 2
        },
        {
            "Address": "2627 Dolores St, SF",
            "Amenities": ["Rooftop", "Pet-friendly", "Garage"],
            "Rental Price": "$4,200",
            "Number of Rooms": 3
        },
        {
            "Address": "2829 California St, SF",
            "Amenities": ["Gym", "Pool", "Laundry"],
            "Rental Price": "$3,500",
            "Number of Rooms": 1
        },
        {
            "Address": "3031 Bay St, SF",
            "Amenities": ["Parking", "Garden", "Gym"],
            "Rental Price": "$3,000",
            "Number of Rooms": 1
        },
        {
            "Address": "3233 Valencia St, SF",
            "Amenities": ["Rooftop", "Laundry", "Pool"],
            "Rental Price": "$3,800",
            "Number of Rooms": 2
        },
        {
            "Address": "3435 Balboa St, SF",
            "Amenities": ["Garden", "Pet-friendly", "Gym"],
            "Rental Price": "$3,100",
            "Number of Rooms": 1
        },
        {
            "Address": "3637 Broderick St, SF",
            "Amenities": ["Pool", "Parking", "Gym"],
            "Rental Price": "$4,400",
            "Number of Rooms": 3
        },
        {
            "Address": "3839 Geary Blvd, SF",
            "Amenities": ["Rooftop", "Laundry", "Garage"],
            "Rental Price": "$3,700",
            "Number of Rooms": 2
        },
        {
            "Address": "4041 Jackson St, SF",
            "Amenities": ["Gym", "Garden", "Pool"],
            "Rental Price": "$2,900",
            "Number of Rooms": 1
        },
        {
            "Address": "4243 Chestnut St, SF",
            "Amenities": ["Laundry", "Rooftop", "Pet-friendly"],
            "Rental Price": "$4,100",
            "Number of Rooms": 3
        },
        {
            "Address": "4445 Union St, SF",
            "Amenities": ["Garden", "Gym", "Parking"],
            "Rental Price": "$3,200",
            "Number of Rooms": 2
        }
    ]
    return sf_addresses

def openai_call(human_message: str, system_message: str):
    llm = ChatOpenAI(model_name='gpt-4o-mini', temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
    messages = [SystemMessage(content=system_message), HumanMessage(content=human_message)]
    response = llm.invoke(messages)
    return response.content


def web_search(address: str):
    tavily_client = TavilyClient(api_key=os.environ["TAVILY_API_KEY"])
    results = tavily_client.search(
        query=f'{address} reviews',
        max_results=4
    )
    
    if isinstance(results, dict) and 'results' in results:
        return [{"content": item.get("content", ""), "url": item.get("url", "")} 
                for item in results['results'] if isinstance(item, dict)]
    elif isinstance(results, list):
        return [{"content": item.get("content", ""), "url": item.get("url", "")} 
                for item in results if isinstance(item, dict)]
    else:
        return []

def query_weaviate(query: str):
    wcd_url = os.getenv("WEAVIATE_ENDPOINT")
    wcd_api_key = os.getenv("WEAVIATE_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    client = weaviate.connect_to_weaviate_cloud(
        cluster_url=wcd_url,
        auth_credentials=wvc.init.Auth.api_key(wcd_api_key),
        headers={"X-OpenAI-Api-Key": openai_api_key}
    )

    try:
        questions = client.collections.get("craigslist-db")

        response = questions.query.fetch_objects()

        results = []
        for o in response.objects:
            results.append(o.properties)

        return results

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

    finally:
        client.close()

class RunAgent:
    def __init__(self, query: str):
        self.query = query
    
    def clarify_requirements_tool(self, budget, amenities, move_in_date, family_size):
        string_of_requirements = f'Budget: {budget}, Amenities: {amenities}, Move-in date: {move_in_date}, Family size: {family_size}'

        string_of_available_addresses = str(read_sf_addresses())

        response = openai_call(string_of_requirements + string_of_available_addresses, clarify_requirements_prompt)

        response = json.loads(response)

        for item in response:
            item['address'] = item['address'].replace('"', '')
            review_analysis = self.analyze_reviews(item['address'])
            item['summary_of_review'] = review_analysis.get('summary_of_review', 'No review summary available')

        return response


    def get_address_tool(self):
        all_addresses = read_sf_addresses()
        random_addresses = random.sample(all_addresses, 20)
        return json.loads(random_addresses)
    
    def analyze_reviews(self, address: str):
        reviews = web_search(address)
        # Extract and join all content strings
        reviews_content = ' '.join([review["content"] for review in reviews])
        response = openai_call(reviews_content, review_analyzer_prompt)
        
        return json.loads(response)
    
    def generate_overview(self):
        pass





