from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView, RedirectView

from django.contrib import admin
from django.urls import path, include, re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    # Redirect /admin to /admin/ to prevent React from capturing it
    path('admin', RedirectView.as_view(url='/admin/', permanent=True)),
    path('api/', include('api.urls')),
    # Match all other routes to index.html for SPA
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
