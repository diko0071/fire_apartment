from django.urls import path
from .views import *

urlpatterns = [
    path('get_review/', get_review, name='get-review'),
    path('get_properties/', get_properties, name='get-properties'),
    path('get_sf_addresses/', get_sf_addresses, name='get-sf-addresses'),
    path('clarify_requirements/', clarify_requirements, name='clarify-requirements'),
    path('get_reviews_raw/', get_reviews_raw, name='get-reviews-raw'),
]

