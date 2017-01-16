"use strict";

app.controller('edashCtrl', function ($scope, $state, $firebaseArray, $http
  , $cordovaToast
  , $cordovaLocalNotification
  , $cordovaSocialSharing
  , $ionicLoading
  , $ionicPlatform
  , $ionicPopover
  , $log
  , $rootScope
  , $ionicModal
  , $ionicSlideBoxDelegate
  , $ionicPopup
  , TDCardDelegate
  , $timeout) {


  $scope.init = function () {
    $ionicPlatform.registerBackButtonAction(function (event) {
      event.preventDefault();
    }, 100);
    $rootScope.registering = false;
    $scope.usercurent = '';
    $scope.usercard = '';


    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {

        console.log("i'm in", user.uid);
        $scope.userid = user.uid;
        var tokenRef = firebase.database().ref("token/" + $scope.userid);
        tokenRef.on('value', function (snap) {
          $scope.currenttoken = snap.val();
          if ((!$scope.currenttoken || $scope.currenttoken.tokenId != $rootScope.tokenuser)&& $rootScope.tokenuser ) {
            $scope.currenttoken = $rootScope.tokenuser;
            tokenRef.update({
                userid: $scope.userid,
                tokenId: $rootScope.tokenuser
              }
            )
          }
        });
        var userRef = firebase.database().ref('user/employer/' + $scope.userid);
        userRef.on('value', function (snapshot) {
          $scope.usercurent = snapshot.val();
        });
        var filtersRef = firebase.database().ref('filter/' + $scope.userid).on('value', function (snap) {
          $scope.newfilter = snap.val();
          $scope.userdistance = $scope.newfilter.distance
        });
        $ionicLoading.show({
          template: '<p>Đang tải dữ liệu ứng viên...</p><ion-spinner></ion-spinner>'
        });
        var cardRef = firebase.database().ref('user/jobber');
        cardRef.once('value', function (snap) {
          $ionicLoading.hide();
          $scope.Objcards = snap.val();
          console.log('object', $scope.Objcards);
          $scope.doRefresh();


        });

        $timeout(function () {
          $scope.userchat = $firebaseArray(cardRef);
          console.log("chat", $scope.userchat);
        }, 2000);

        var newmessagesRef = firebase.database().ref('newmessages/' + $scope.userid);
        newmessagesRef.on('value', function (snap) {
          $scope.newmessage = snap.val();
        });


        $scope.checknewmessage = function () {
          if ($scope.newmessage) {
            $scope.totalcount = 0;

            for (var obj in $scope.newmessage) {
              $scope.totalcount++;
            }
            return ($scope.totalcount > 0);
          }
        };
        // Get a database reference to our posts
      } else {
        // No user is signed in.
        $state.go("login");
      }

    });
  };

  $scope.$back = function () {
    window.history.back();
  };


  //refresh swiper card
  $scope.onReadySwiper = function (swiper) {
    console.log('ready');
    $scope.swiper = swiper;
  };

  //Tinh khoang cach
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var x = R * c; // Distance in km
    var n = parseFloat(x);
    x = Math.round(n * 10) / 10;
    return x;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180)
  }

  //end tinh khoang cach

  $scope.doRefresh = function () {

    $scope.mylat = $scope.usercurent.location.location.lat;
    $scope.mylng = $scope.usercurent.location.location.lng;
    $scope.usercard = [];
    angular.forEach($scope.Objcards, function (card) {
      if (card.location && card.location.location) {
        var yourlat = card.location.location.lat;
        var yourlng = card.location.location.lng;
        var distance = getDistanceFromLatLonInKm($scope.mylat, $scope.mylng, yourlat, yourlng);


        if ((card.stars && !card.stars[$scope.userid]) && (card.disstars && !card.disstars[$scope.userid]) && distance < $scope.userdistance) {
          card.distance = distance;
          if ($scope.newfilter && $scope.newfilter.onlydistance === true) {
            $scope.usercard.push(card)

          } else {
            if (card.interest && card.interest.time && card.interest.time[$scope.newfilter.time] && card.interest.job && card.interest.job[$scope.newfilter.job]) {
              $scope.usercard.push(card)

            }
          }
        }
      }
    });
    console.log("array", $scope.usercard);
    $scope.swiper.update();
  };

  $scope.ontouch = function (swiper) {
    $scope.swiper = swiper;
    $scope.swiper.update();

    console.log($scope.swiper.activeIndex);
    if ($scope.swiper.activeIndex == $scope.limit - 1){
      $scope.limit = $scope.limit + 5;
    }
  };
  $scope.viewliked = function () {
    $ionicModal.fromTemplateUrl('templates/modals/liked/eliked.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();
      var userlikeRef = firebase.database().ref('user/jobber').orderByChild('stars/' + $scope.userid).equalTo(true);
      userlikeRef.on('value', function (snap) {
        $scope.liked = snap.val();
        console.log('filter', snap.val())
      });
      $scope.hideliked = function () {
        $scope.modalProfile.hide();

      }

    })
  };
  $scope.changefilter = function () {

    $scope.newfilter.onlydistance = true;
    $scope.doRefresh();

  };

  $scope.editjob = function () {
    if (!$scope.newfilter) {
      $scope.newfilter = {};
    }
    $ionicModal.fromTemplateUrl('templates/modals/efilter.html', {
      scope: $scope,
      animation: 'animated _zoomOut',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();
      $scope.cancel = function () {
        $scope.modalProfile.hide();

      }
      $scope.showjob = function () {
        $scope.selectjob = function (selectedjob) {
          $scope.newfilter.job = selectedjob;
          console.log('select', $scope.newfilter)

        };
        $ionicPopup.confirm({
          title: 'Vị trí bạn đang cần tuyển',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/select-job.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure');

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.showtime = function () {
        $scope.selecttime = function (selectedtime) {
          $scope.newfilter.time = selectedtime;
          console.log('select', $scope.newfilter)
        };
        $ionicPopup.confirm({
          title: 'Ca làm việc',
          scope: $scope,
          // template: 'Are you sure you want to eat this ice cream?',
          templateUrl: 'templates/popups/select-time.html',
          cssClass: 'animated bounceInUp dark-popup',
          okType: 'button-small button-dark bold',
          okText: 'Done',
          cancelType: 'button-small'
        }).then(function (res) {
          if (res) {
            console.log('You are sure');

          } else {
            console.log('You are not sure');
          }
        });
      };
      $scope.createHospital = function () {
        var uid = firebase.auth().currentUser.uid;
        var filtersRef = firebase.database().ref('filter/' + uid);

        console.log($scope.newfilter);
        filtersRef.update($scope.newfilter)
        $scope.modalProfile.hide();
        $scope.doRefresh();
      };
    });
  };


  $scope.slideHasChanged = function (index) {
    console.log('slideHasChanged');
    $scope.slideIndex = index
  };

  $scope.slideTo = function (index) {
    $ionicSlideBoxDelegate.slide(index);
  };
  $scope.deviceHeight = window.innerHeight;


  $scope.slideIndex = 1;
// to logout


  $scope.$watch(function (scope) {
      return scope.slideIndex
    },
    function (newValue, oldValue) {
      switch (newValue) {
        case 0:
        case 2:
          $ionicSlideBoxDelegate.enableSlide(false);
          break;
      }
    }
  );
  $scope.share = function () {
    $cordovaSocialSharing
      .shareViaFacebook("Tuyển nhân viên nhanh chóng và hiệu quả!", "", 'https://www.facebook.com/jobovietnam')
      .then(function (result) {
        // Success!
      }, function (err) {
        // An error occurred. Show a message to the user
      });

  };


  $scope.matchlike = "";

  if (!$rootScope.userliked) {
    $rootScope.userliked = [];
  }
  if (!$rootScope.userdisliked) {
    $rootScope.userdisliked = [];
  }
  $scope.like = function () {
    var likewithpost = $scope.usercard[$scope.swiper.activeIndex].userid;
    $scope.matchlike = likewithpost;
    var toTokenRef = firebase.database().ref('token/' + likewithpost);
    toTokenRef.on('value', function (snap) {
      $scope.toToken = snap.val();
      console.log("token", $scope.toToken)

    });
    if ($scope.toToken) {
      var fcm_server_key = "AAAArk3qIB4:APA91bEWFyuKiFqLt4UIrjUxLbduQCWJB4ACptTtgAovz4CKrMdonsS3jt06cfD9gGOQr3qtymBmKrsHSzGhqyJ_UWrrEbA4YheznlqYjsCBp_12bNPFSBepqg_qrxwdYxX_IcT9ne5z6s02I2mu2boy3VTN3lGPYg";

      $http({
        method: "POST",
        dataType: 'jsonp',
        headers: {'Content-Type': 'application/json', 'Authorization': 'key=' + fcm_server_key},
        url: "https://fcm.googleapis.com/fcm/send",
        data: JSON.stringify(
          {
            "notification": {
              "title": "Lượt thích mới ",  //Any value
              "body": $scope.usercurent.name + " đã thích hồ sơ của bạn, apply vào đây thôi! ",  //Any value
              "sound": "default", //If you want notification sound
              "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
              "icon": "fcm_push_icon"  //White icon Android resource
            },
            "data": {
              "param1": '#/schats/',  //Any data to be retrieved in the notification callback
              "param2": "fromSeeker"
            },
            "to": $scope.toToken.tokenId, //Topic or single device
            "priority": "high", //If not set, notification won't be delivered on completely closed iOS app
            "restricted_package_name": "" //Optional. Set for application filtering
          }
        )
      }).success(function (data) {
        console.log("Success: " + JSON.stringify(data));
      }).error(function (data) {
        console.log("Error: " + JSON.stringify(data));
      });
    }

    if (!$rootScope.userdisliked[likewithpost]) {
      $scope.userliked[likewithpost] = true;
      console.log($scope.userliked);

      var uid = firebase.auth().currentUser.uid;
      var globalPostRef = firebase.database().ref('/user/jobber/' + likewithpost);


      toggleStar(globalPostRef, uid);
      console.log(likewithpost);

      // Listen for the starred status.
      var starredStatusRef = firebase.database().ref('/user/jobber/' + likewithpost + '/stars/' + uid);
      starredStatusRef.on('value', function (snapshot) {
        $scope.starred = snapshot.val();
        $scope.keystar = snapshot.key;
        console.log($scope.keystar);
      });

    }
    $timeout(function () {
      $scope.swiper.slideNext();
    }, 1000);
  };
  function toggleStar(postRef, uid) {
    postRef.transaction(function (post) {
      console.log("sap like dc roi", uid);

      if (post) {
        if (post.stars && post.stars[uid] && post.disstars && post.disstars[uid]) {

        } else {
          post.starCount++;
          if (!post.stars) {
            post.stars = {};
          }
          post.stars[uid] = true;



          console.log("done", uid);
          var obj = $scope.usercurent.stars;
          // Check if user has already liked me
          for (var prop in obj) {
            if (prop == $scope.matchlike) {
              itsAMatch();
            }
          }

        }
      }
      return post;
    });
  }

  $scope.dislike = function () {
    var likewithpost = $scope.usercard[$scope.swiper.activeIndex].userid;
    $scope.matchlike = likewithpost;
    if (!$rootScope.userliked[likewithpost]) {
      $scope.userdisliked[likewithpost] = true;
      console.log($scope.userdisliked);
      var uid = firebase.auth().currentUser.uid;
      var globalPostRef = firebase.database().ref('/user/jobber/' + likewithpost);
      distoggleStar(globalPostRef, uid);
      console.log(likewithpost);
    }
    $timeout(function () {
      $scope.swiper.slideNext();
    }, 1000);

  };

// [START post_stars_transaction]
  function distoggleStar(postRef, uid) {
    postRef.transaction(function (post) {
      console.log("sap dislike dc roi", uid);

      if (post) {
        if (post.stars && post.stars[uid] && post.disstars && post.disstars[uid]) {

        } else {
          post.disstarCount++;
          if (!post.disstars) {
            post.disstars = {};
          }
          post.disstars[uid] = true;
          console.log("done", uid);


        }
      }
      return post;
    });
  }
  $scope.limit= 5;


  $scope.onTouch = function () {
    $ionicSlideBoxDelegate.enableSlide(false);
    console.log('touched');

  };
  $scope.onRelease = function () {
    $ionicSlideBoxDelegate.enableSlide(true);
    console.log('released');
  };


  function itsAMatch() {
    $ionicModal.fromTemplateUrl('templates/modals/ematch.html', {
      scope: $scope,
      animation: 'animated _fadeOut',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalMatch = modal;
      $scope.modalMatch.show();
      $scope.matched = $scope.Objcards[$scope.matchlike];

      var uid = firebase.auth().currentUser.uid;

      var matchedRef = firebase.database().ref('/user/jobber/' + $scope.matched.userid);
      matchStar(matchedRef, uid);
      var matchRef = firebase.database().ref('/user/employer/' + uid);
      matchStar(matchRef, $scope.matched.userid);


      function matchStar(matchRef, uid) {
        matchRef.transaction(function (post) {
          console.log("sap match dc roi", uid);

          if (post) {
            if (post.match && post.match[uid]) {
              post.match[uid] = null;
            } else {
              if (!post.match) {
                post.match = {};
              }
              post.match[uid] = true;
              console.log("done", uid);


            }
          }
          return post;
        });
      }


      $scope.chat = function () {
        $state.go("/chats/" + $scope.matched.userid)
      };

      $scope.hideMatch = function () {
        $scope.modalMatch.hide();
      }
    });
  }
})
;
