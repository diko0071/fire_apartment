from django.db import models

class AgentRunLog(models.Model):
    query = models.CharField(max_length=255)
    response = models.TextField()
    meta = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)