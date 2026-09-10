import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Payment
from .serializers import PaymentSerializer
import paypalrestsdk
import logging

logger = logging.getLogger(__name__)

class PaymentCreateView(APIView):
    def post(self, request):
        try:
            serializer = PaymentSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            data = serializer.validated_data

            base_url = os.getenv('BACKEND_URL', request.build_absolute_uri('/').rstrip('/'))
            payment = paypalrestsdk.Payment({
                "intent": "sale",
                "payer": {"payment_method": "paypal"},
                "redirect_urls": {
                    "return_url": f"{base_url}/api/v1/payment/execute",
                    "cancel_url": f"{base_url}/api/v1/payment/cancel"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "Business Payment",
                            "sku": "001",
                            "price": str(data['amount']),
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "total": str(data['amount']),
                        "currency": "USD"
                    },
                    "description": f"Payment by {data['customer_name']}"
                }]
            })

            if payment.create():
                new_payment = Payment.objects.create(
                    customer_name=data.get('customer_name'),
                    customer_email=data.get('customer_email'),
                    course=data.get('course'),
                    membership_id=request.data.get('membership'),
                    payment_type=request.data.get('payment_type', 'course'),
                    amount=data.get('amount'),
                    paypal_payment_id=payment.id,
                    status='created'
                )
                return Response({
                    "status": "success",
                    "payment_id": new_payment.id,
                    "paypal_payment_id": payment.id,
                    "approval_url": next(link.href for link in payment.links if link.rel == "approval_url")
                }, status=status.HTTP_201_CREATED)

            logger.error(f"PayPal payment creation failed: {payment.error}")
            return Response({"status": "error", "message": str(payment.error)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error in PaymentCreateView: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": f"An unexpected error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentStatusView(APIView):
    def get(self, request, pk):
        try:
            payment = Payment.objects.get(id=pk)
            serializer = PaymentSerializer(payment)
            return Response({
                "payment": serializer.data,
                "status": "success",
                "message": "Payment details retrieved successfully."
            }, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Payment not found."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in PaymentStatusView for pk={pk}: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": "An unexpected error occurred."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentExecuteView(APIView):
    def get(self, request):
        try:
            payment_id = request.GET.get('paymentId')
            payer_id = request.GET.get('PayerID')
            if not payment_id or not payer_id:
                return Response({
                    "status": "error",
                    "message": "Missing paymentId or PayerID. Please ensure the payment is approved via PayPal."
                }, status=status.HTTP_400_BAD_REQUEST)

            payment = paypalrestsdk.Payment.find(payment_id)
            if payment.execute({"payer_id": payer_id}):
                db_payment = Payment.objects.get(paypal_payment_id=payment_id)
                db_payment.status = 'completed'
                db_payment.save()

                if db_payment.payment_type == 'membership' and db_payment.membership:
                    from datetime import date
                    from dateutil.relativedelta import relativedelta
                    membership = db_payment.membership
                    membership.status = 'active'
                    membership.payment_status = 'paid'
                    membership.start_date = date.today()
                    membership.expiry_date = date.today() + relativedelta(years=1)
                    membership.save()
                    
                    try:
                        from Auth.views import send_membership_approved_email
                        send_membership_approved_email(membership)
                    except Exception as e:
                        logger.error(f"Failed to send membership email to {membership.email}: {e}")

                return Response({
                    "status": "success",
                    "message": "Payment executed successfully",
                    "payment_id": db_payment.id
                }, status=status.HTTP_200_OK)
            else:
                error = payment.error
                logger.error(f"Payment execution failed: {error}")
                if error.get('name') == 'PAYMENT_NOT_APPROVED_FOR_EXECUTION':
                    return Response({
                        "status": "error",
                        "message": "Payment not approved by payer. Please complete approval on PayPal."
                    }, status=status.HTTP_400_BAD_REQUEST)
                return Response({
                    "status": "error",
                    "message": str(error)
                }, status=status.HTTP_400_BAD_REQUEST)
        except paypalrestsdk.ResourceNotFound:
            return Response({
                "status": "error",
                "message": "Payment not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Payment.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Payment not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in PaymentExecuteView: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": f"An unexpected error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentCancelView(APIView):
    def get(self, request):
        try:
            payment_id = request.GET.get('paymentId')
            if not payment_id:
                return Response({
                    "status": "error",
                    "message": "Missing paymentId"
                }, status=status.HTTP_400_BAD_REQUEST)

            db_payment = Payment.objects.get(paypal_payment_id=payment_id)
            db_payment.status = 'cancelled'
            db_payment.save()
            return Response({
                "status": "success",
                "message": "Payment cancelled successfully",
                "payment_id": db_payment.id
            }, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Payment not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in PaymentCancelView: {str(e)}", exc_info=True)
            return Response({
                "status": "error",
                "message": f"An unexpected error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.db.models import Sum
from django.db.models.functions import TruncWeek, TruncMonth, TruncYear
from django.utils import timezone
from Auth.decorator import is_admin
from rest_framework.permissions import IsAuthenticated
from SuperSetting.models import SiteSetting
from Course.models import Course
from .models import NegotiationIncome
from rest_framework.serializers import ModelSerializer

class NegotiationIncomeSerializer(ModelSerializer):
    class Meta:
        model = NegotiationIncome
        fields = '__all__'

class NegotiationIncomeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        incomes = NegotiationIncome.objects.all().order_by('-date')
        serializer = NegotiationIncomeSerializer(incomes, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.user_type != 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = NegotiationIncomeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FinanceOverviewAPIView(APIView):
    """
    API for superadmin to view financial income overview (weekly, monthly, yearly).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            
        # Get completed payments only
        payments = Payment.objects.filter(status='completed')

        weekly_income = payments.annotate(period=TruncWeek('created_at')).values('period').annotate(total=Sum('amount')).order_by('period')
        monthly_income = payments.annotate(period=TruncMonth('created_at')).values('period').annotate(total=Sum('amount')).order_by('period')
        yearly_income = payments.annotate(period=TruncYear('created_at')).values('period').annotate(total=Sum('amount')).order_by('period')
        
        # Negotiations
        negotiations = NegotiationIncome.objects.all()
        neg_total = negotiations.aggregate(total=Sum('amount'))['total'] or 0
        payment_total = payments.aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'weekly': weekly_income,
            'monthly': monthly_income,
            'yearly': yearly_income,
            'total_income': payment_total + neg_total
        })

class CourseIncomeAPIView(APIView):
    """
    API for superadmin to view income per course.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'admin' and not request.user.is_superuser:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
            
        courses = Course.objects.all()
        data = []
        for course in courses:
            income = Payment.objects.filter(course=course, status='completed').aggregate(total=Sum('amount'))['total'] or 0
            enrollments = course.enrollments.count()
            data.append({
                'course_id': course.id,
                'title': course.title,
                'price': course.price,
                'currency': course.current,
                'total_income': income,
                'enrollments': enrollments
            })
            
        return Response(data)

class ExternalFinanceAPIView(APIView):
    """
    External API for Trusterlabs Financial Department.
    Protected by X-API-Key header.
    """
    permission_classes = [] # Handled manually

    def get(self, request):
        api_key = request.headers.get('X-API-Key')
        setting = SiteSetting.objects.first()
        if not setting or not setting.external_finance_api_key or setting.external_finance_api_key != api_key:
            return Response({'detail': 'Invalid or missing API Key.'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # Compile response
        payments = Payment.objects.filter(status='completed')
        neg_total = NegotiationIncome.objects.all().aggregate(total=Sum('amount'))['total'] or 0
        total_income = (payments.aggregate(total=Sum('amount'))['total'] or 0) + neg_total
        
        course_data = []
        courses = Course.objects.all()
        for course in courses:
            income = Payment.objects.filter(course=course, status='completed').aggregate(total=Sum('amount'))['total'] or 0
            if income > 0:
                course_data.append({
                    'course_id': course.id,
                    'title': course.title,
                    'price': course.price,
                    'total_income': income
                })
                
        return Response({
            'total_platform_income': total_income,
            'income_by_course': course_data
        })