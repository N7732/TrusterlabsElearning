from django.db import models
from Auth.models import User

class Payment(models.Model):
    Payment_Status = [
        ('Created', 'Created'),
        ('approved', 'Approved'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('Completed', 'Completed'),
    ]
    customer_name = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='payments')
    customer_email = models.EmailField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paypal_payment_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=Payment_Status, default='Completed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.amount} - {self.status}"
    
    

