import django_filters
from .models import Event

class EventFilter(django_filters.FilterSet):
    starts_after = django_filters.DateTimeFilter(field_name='starts_at', lookup_expr='gte')
    starts_before = django_filters.DateTimeFilter(field_name='starts_at', lookup_expr='lte')
    q = django_filters.CharFilter(method='filter_search')
    
    class Meta:
        model = Event
        fields = ['location', 'language', 'starts_after', 'starts_before']

    def filter_search(self, queryset, name, value):
        return queryset.filter(title__icontains=value) | queryset.filter(description__icontains=value)
