from django.db import models
from Auth.models import User
from Membership.models import Membership

class Payment(models.Model):
    Payment_Status = [
        ('created', 'Created'),
        ('approved', 'Approved'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    PAYMENT_TYPE_CHOICES = (
        ('course', 'Course'),
        ('membership', 'Membership'),
    )

    customer_name = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='payments')
    customer_email = models.EmailField()
    course = models.ForeignKey('Course.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    membership = models.ForeignKey(Membership, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='course')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paypal_payment_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=Payment_Status, default='completed')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer_name} - {self.amount} - {self.status}"

class NegotiationIncome(models.Model):
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(max_length=255)
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.pk:
            from django.core.exceptions import ValidationError
            raise ValidationError("Negotiation Income records are immutable and cannot be updated.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Negotiation: {self.amount} on {self.date}"
