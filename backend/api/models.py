
from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=100)
    image = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(max_length=500, blank=True, null=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    rating = models.FloatField(default=0.0)
    calories = models.IntegerField(default=0)
    is_promoted = models.BooleanField(default=False)
    discount_percentage = models.IntegerField(default=0)

    def __str__(self):
        return self.name
    
    @property
    def discounted_price(self):
        if self.is_promoted and self.discount_percentage > 0:
            discount = (self.price * self.discount_percentage) / 100
            return self.price - discount
        return self.price

class Order(models.Model):
    STATUS_CHOICES = [
        ('received', 'Order Received'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('out_for_delivery', 'Out for Delivery'),
        ('delivered', 'Delivered'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = models.TextField(blank=True, null=True)
    payment_method = models.CharField(max_length=20, default='mpesa')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
