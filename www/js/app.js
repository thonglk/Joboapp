// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('starter', ['ionic', 'firebase', 'starter.configs', 'ngCordova', 'ui.mask'
  , 'angular-cache'
  , 'monospaced.elastic'
  , 'starter.controllers'
  , 'starter.services'
  , 'starter.directives'
  , 'monospaced.elastic'
  , 'ksSwiper'
  , 'ionic.contrib.ui.tinderCards2'
  , 'ionic.cloud'
])

  .config(function ($ionicCloudProvider) {
    $ionicCloudProvider.init({
      "core": {
        "app_id": "3063d2c3"
      }
    });
  })


  .run(function ($ionicPlatform, $timeout, $rootScope, $state, $ionicDeploy, $cordovaSpinnerDialog, $ionicPopup) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }


      FCMPlugin.onNotification(
        function (data) {
          if (data.wasTapped) {
            $state.go(data.param1);
            //Notification was received on device tray and tapped by the user.
          } else {
            //Notification was received in foreground. Maybe the user needs to be notified.
            var alertPopup = $ionicPopup.alert({
              title: 'Thông báo ',
              template: '<p style="text-align: center">Bạn có một thông báo mới </p>'
            });
            alertPopup.then(function (res) {
            });
          }
        }
      );
    });
  })

  .config(function (CacheFactoryProvider) {
    angular.extend(CacheFactoryProvider.defaults, {maxAge: 15 * 60 * 1000});
  })
  .service('BookService', function (CacheFactory, $http) {
    if (!CacheFactory.get('bookCache')) {
      // or CacheFactory('bookCache', { ... });
      CacheFactory.createCache('bookCache', {
        deleteOnExpire: 'aggressive',
        recycleFreq: 60000
      });
    }

    var bookCache = CacheFactory.get('bookCache');

    return {
      findBookById: function (id) {
        return $http.get('/api/books/' + id, {cache: bookCache});
      }
    };
  })

  .config(function ($provide, $ionicConfigProvider, $compileProvider) {
    $ionicConfigProvider.tabs.position('bottom');
    // $ionicConfigProvider.scrolling.jsScrolling(false);
    // $translateProvider.useStaticFilesLoader({
    //     prefix: 'l10n/',
    //     suffix: '.json'
    //   });
    // $translateProvider.preferredLanguage("en");
    // $translateProvider.fallbackLanguage("en");
    $ionicConfigProvider.scrolling.jsScrolling(false);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|cdvfile|file|filesystem|blob):|data:image\//);
    $ionicConfigProvider.backButton.text(null).icon('ion-chevron-left color-white');
  })

  .run(function ($rootScope, $ionicLoading) {
    $ionicLoading.show({
      template: '<p>Đang tải dữ liệu...!</p><ion-spinner></ion-spinner>'
    });
    firebase.database().ref('data').on('value', function (snap) {
      $rootScope.dataJob = snap.val().job;
      $rootScope.time = snap.val().time;
      $rootScope.industry = snap.val().industry;
      $ionicLoading.hide()
    })
  })
  .config(function ($stateProvider, $urlRouterProvider) {


    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:
      .state('login', {
        url: '/login',
        templateUrl: "templates/login.html",
        controller: "loginController"
      })
      .state('ssignup', {
        url: '/ssignup',
        templateUrl: "templates/signup/seekersignup.html",
        controller: "ssignupController"
      })
      .state('esignup', {
        url: '/esignup',
        templateUrl: "templates/signup/employersignup.html",
        controller: "esignupController"
      })


      .state('reset', {
        url: '/reset',
        templateUrl: "templates/resetemail.html",
        controller: "resetController"
      })


      .state('intro', {
        url: '/intro',
        templateUrl: "templates/intro.html",
        controller: "introController"
      })
      .state('edash', {
        url: '/edash',
        templateUrl: "templates/dash/edash.html",
        controller: "edashCtrl"
      })
      .state('sdash', {
        url: '/sdash',
        templateUrl: 'templates/dash/sdash.html',
        controller: 'DashCtrl'
      })


      .state('schat-detail', {
        url: '/schats/:chatId',
        templateUrl: 'templates/chat/schat-detail.html',
        controller: 'sChatDetailCtrl'
      })
      .state('echat-detail', {
        url: '/echats/:chatId',
        templateUrl: 'templates/chat/echat-detail.html',
        controller: 'eChatDetailCtrl'
      })
      .state('sprofile', {
        url: '/sprofile',
        templateUrl: "templates/profile/sprofile.html",
        controller: "sprofileCtrl"

      })

      .state('eviewprofile', {
        url: '/eviewprofile/:id',
        templateUrl: 'templates/modals/view/eprofile.html',
        controller: 'eViewProfileCtrl'
      })
      .state('eprofile', {
        url: '/eprofile',
        templateUrl: "templates/profile/eprofile.html",
        controller: "eprofileCtrl"

      })

      .state('sviewprofile', {
        url: '/sviewprofile/:id',
        templateUrl: 'templates/modals/view/sprofile.html',
        controller: 'sViewProfileCtrl'
      })
      .state('eAccount', {
        url: '/eAccount',
        templateUrl: "templates/account/eAccount.html",
        controller: "eAccountCtrl"

      })
      .state('sAccount', {
        url: '/sAccount',
        templateUrl: "templates/account/sAccount.html",
        controller: "sAccountCtrl"

      })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('intro');

  });



