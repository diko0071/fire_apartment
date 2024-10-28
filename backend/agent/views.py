from django.shortcuts import render
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from .services import RunAgent, query_weaviate, read_sf_addresses, web_search

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def get_review(request):
    address = request.data.get('address')
    agent = RunAgent(address)
    response = agent.analyze_reviews(address)
    return Response(response)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def get_properties(request):
    query = request.data.get('query')
    response = query_weaviate(query)
    return Response(response)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_sf_addresses(request):
    response = read_sf_addresses()
    return Response(response)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def clarify_requirements(request):
    budget = request.data.get('budget')
    amenities = request.data.get('amenities')
    move_in_date = request.data.get('move_in_date')
    family_size = request.data.get('family_size')
    response = RunAgent(request.data.get('query')).clarify_requirements_tool(budget, amenities, move_in_date, family_size)
    return Response(response)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def get_reviews_raw(request):
    address = request.data.get('address')
    if not address:
        return Response({"error": "Address is required"}, status=400)
    try:
        response = web_search(address)
        return Response(response)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
