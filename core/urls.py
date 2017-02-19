from django.conf.urls import url

from core import views

urlpatterns = [
    url(r'^api/accounts/login/$', views.LoginView.as_view(), name='login'),
    url(r'^api/accounts/logout/$', views.LogoutView.as_view(), name='logout'),
    url(r'^api/accounts/profile/$', views.ProfileView.as_view(), name='profile'),
    url(r'^api/itemcounts/$', views.ItemCountsView.as_view()),
    url(r'^api/itemcounts/(?P<query>.*)/(?P<unit>(yearly|monthly))/$', views.ItemCountListView.as_view()),
    url(r'^api/itemcounts/(?P<query>.*)/(?P<unit>(yearly|monthly))/(?P<d>[0-9-]+)/$', views.ItemCountView.as_view()),
    url(r'^api', views.not_found),
    url(r'', views.index, name="index"),
]
