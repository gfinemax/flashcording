from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
def health_check(request):
    """
    Health check endpoint
    """
    return Response({
        'status': 'healthy',
        'message': 'Django server is running!'
    }, status=status.HTTP_200_OK)


@api_view(['GET', 'POST'])
def hello_world(request):
    """
    Sample API endpoint
    """
    if request.method == 'GET':
        return Response({
            'message': 'Hello from Django!',
            'method': 'GET'
        })
    elif request.method == 'POST':
        name = request.data.get('name', 'Guest')
        return Response({
            'message': f'Hello, {name}!',
            'method': 'POST',
            'data_received': request.data
        })
