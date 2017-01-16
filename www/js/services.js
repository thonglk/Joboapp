angular.module('starter.services', [])
  .service('myService', function (CacheFactory) {
    var profileCache;

    // Check to make sure the cache doesn't already exist
    if (!CacheFactory.get('profileCache')) {
      profileCache = CacheFactory('profileCache');
    }
  })
