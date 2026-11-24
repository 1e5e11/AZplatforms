/* AZ presented — push notifications (no article content, only "new post" alerts) */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

function scopedTarget(url) {
  try {
    var resolved = new URL(String(url || ''), self.registration.scope);
    if (resolved.href.indexOf(self.registration.scope) === 0) return resolved.href;
  } catch (e) {
    /* fall through */
  }
  return self.registration.scope;
}

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  var title = data.title || '有新文章发布';
  var options = {
    body: data.body || '点击打开博客查看最新文章',
    tag: data.tag || 'az-new-post',
    renotify: true,
    data: { url: scopedTarget(data.url) }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var target = scopedTarget(event.notification.data && event.notification.data.url);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i += 1) {
        var client = list[i];
        if (client.url.indexOf(self.registration.scope) === 0) {
          if ('navigate' in client) {
            return client.navigate(target).then(function () {
              return client.focus();
            }).catch(function () {
              return client.focus();
            });
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    })
  );
});
