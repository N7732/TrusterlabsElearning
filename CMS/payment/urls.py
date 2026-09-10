from django.urls import path
from .views import (
    PaymentCreateView, PaymentStatusView, PaymentExecuteView, PaymentCancelView,
    FinanceOverviewAPIView, CourseIncomeAPIView, ExternalFinanceAPIView, NegotiationIncomeAPIView
)

urlpatterns = [
    path('payments/', PaymentCreateView.as_view(), name='initiate-payment'),
    path('payments/<int:pk>/', PaymentStatusView.as_view(), name='payment-status'),
    path('payment/execute/', PaymentExecuteView.as_view(), name='payment-execute'),
    path('payment/cancel/', PaymentCancelView.as_view(), name='payment-cancel'),
    
    # Financial APIs
    path('finance/overview/', FinanceOverviewAPIView.as_view(), name='finance-overview'),
    path('finance/courses/', CourseIncomeAPIView.as_view(), name='finance-courses'),
    path('finance/external/', ExternalFinanceAPIView.as_view(), name='finance-external'),
    path('finance/negotiations/', NegotiationIncomeAPIView.as_view(), name='finance-negotiations'),
]