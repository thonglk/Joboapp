'use strict';

app.factory("chatMessages", ["$firebaseArray",
  function ($firebaseArray) {
    // create a reference to the database location where we will store our data
    var ref = firebase.database().ref().child("messages");

    // this uses AngularFire to create the synchronized array
    return $firebaseArray(ref);
  }
])

  .factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
      return $firebaseAuth();
    }
  ])

  .controller("eChatDetailCtrl", ["$scope", "chatMessages", "$stateParams", "Auth", "$ionicActionSheet", "$timeout", "$ionicScrollDelegate", "$firebaseArray", "$ionicPopup", "$http", function ($scope, chatMessages, $stateParams, Auth, $ionicActionSheet, $timeout, $ionicScrollDelegate, $firebaseArray, $ionicPopup, $http) {
    $scope.init = function () {

      $scope.firebaseUser = firebase.auth().currentUser.uid;
      console.log("Hihi: ", $scope.firebaseUser);
      var userRef = firebase.database().ref('user/employer/' + $scope.firebaseUser)
      userRef.on('value', function (snap) {
        $scope.usercurent = snap.val();
      })
      // we add chatMessages array to the scope to be used in our ng-repeat
      $scope.messages = chatMessages;


      $scope.formId = $stateParams.chatId;
      var db = firebase.database();
      var ref = db.ref('user/jobber/' + $scope.formId);

// Attach an asynchronous callback to read the data at our posts reference
      ref.on("value", function (snapshotc) {
        console.log("this" + snapshotc.val());
        $scope.fromdata = snapshotc.val();

      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });
    }


    $scope.$back = function () {
      window.history.back();
    };

    $scope.showphone = function () {

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        templateUrl: 'templates/popups/contact.html',
        title: "Liên hệ",
        scope: $scope,
        buttons: [
          {text: 'Cancel'},
        ]
      });

      myPopup.then(function (res) {
        console.log('Tapped!', res);
      });
    };


    $scope.clearnewmes = function () {
      var myRef = firebase.database().ref('newmessages/' + $scope.firebaseUser);
      myRef.transaction(function (post) {

        if (post && post[$scope.formId]) {
          post[$scope.formId] = null;
        }
        return post;
      });
    }


    // a method to create new messages; called by ng-submit
    $scope.addMessage = function () {
      var usersRef = firebase.database().ref('newmessages/' + $scope.formId);
      usersRef.transaction(function (post) {

        if (post && post[$scope.firebaseUser]) {
          post[$scope.firebaseUser]++
        } else {
          if (!post) {
            post = {};
          }
          post[$scope.firebaseUser] = 1;
          console.log("done", $scope.firebaseUser);
        }

        return post;
      });

      // calling $add on a synchronized array is like Array.push(),
      // except that it saves the changes to our database!
      $scope.messages.$add({
        from: $scope.firebaseUser,
        to: $scope.formId,
        text: $scope.newMessageText,
        timestamp: firebase.database.ServerValue.TIMESTAMP

      });
      // push noti

      FCMPlugin.subscribeToTopic('all'); //subscribe current user to topic
      var toTokenRef = firebase.database().ref('token/' + $scope.formId);
      toTokenRef.on('value', function (snap) {
        $scope.toToken = snap.val()
      });
      var fcm_server_key = "AAAArk3qIB4:APA91bEWFyuKiFqLt4UIrjUxLbduQCWJB4ACptTtgAovz4CKrMdonsS3jt06cfD9gGOQr3qtymBmKrsHSzGhqyJ_UWrrEbA4YheznlqYjsCBp_12bNPFSBepqg_qrxwdYxX_IcT9ne5z6s02I2mu2boy3VTN3lGPYg";

      $http({
        method: "POST",
        dataType: 'jsonp',
        headers: {'Content-Type': 'application/json', 'Authorization': 'key=' + fcm_server_key},
        url: "https://fcm.googleapis.com/fcm/send",
        data: JSON.stringify(
          {
            "notification": {
              "title": "Tin nhắn mới",  //Any value
              "body": $scope.fromdata.name +":"+ $scope.newMessageText,  //Any value
              "sound": "default", //If you want notification sound
              "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
              "icon": "fcm_push_icon"  //White icon Android resource
            },
            "data": {
              "param1": '#/echats/'+ $scope.firebaseUser,  //Any data to be retrieved in the notification callback
              "param2": $scope.newMessageText
            },
            "to": $scope.toToken.tokenId, //Topic or single device
            "priority": "high", //If not set, notification won't be delivered on completely closed iOS app
            "restricted_package_name": "" //Optional. Set for application filtering
          }
        )
      }).success(function (data) {
        $scope.reply = $scope.newMessageText;
        console.log("Success: " + JSON.stringify(data));
      }).error(function (data) {
        console.log("Error: " + JSON.stringify(data));
      });
      // reset the message input
      $scope.newMessageText = "";
      $ionicScrollDelegate.$getByHandle('userMessageScroll').scrollBottom();
    };

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

    $scope.onMessageHold = function (e, itemIndex, message) {
      console.log('onMessageHold');
      console.log('message: ' + JSON.stringify(message, null, 2));
      $ionicActionSheet.show({
        buttons: [{
          text: 'Copy Text'
        }, {
          text: 'Delete Message'
        }],
        buttonClicked: function (index) {
          switch (index) {
            case 0: // Copy Text
              //cordova.plugins.clipboard.copy(message.text);

              break;
            case 1: // Delete
              // no server side secrets here :~)
              $scope.messages.splice(itemIndex, 1);
              $timeout(function () {
                viewScroll.resize();
              }, 0);

              break;
          }

          return true;
        }
      });
    };
    // I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function (e, ta) {
      console.log('taResize');
      if (!ta) return;

      var taHeight = ta[0].offsetHeight;
      console.log('taHeight: ' + taHeight);

      if (!footerBar) return;

      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px';
    });
    var footerBar; // gets set in $ionicView.enter
    var scroller;

    $scope.timeConverter = function (timestamp) {
      var a = new Date(timestamp);
      var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = hour + ' : ' + min + ' ' + date + '/' + month + '/' + year;
      return time;
    }
  }
  ])
  .controller("sChatDetailCtrl", ["$scope", "chatMessages", "$stateParams", "Auth", "$ionicActionSheet", "$timeout", "$ionicScrollDelegate", "$firebaseArray", "$http", function ($scope, chatMessages, $stateParams, Auth, $ionicActionSheet, $timeout, $ionicScrollDelegate, $firebaseArray, $http) {
    $scope.init = function () {
      $scope.firebaseUser = firebase.auth().currentUser.uid;
      console.log("Hihi: ", $scope.firebaseUser);
      var cardRef = firebase.database().ref().child('user/employer')

      $scope.userchat = $firebaseArray(cardRef);
      console.log("chat", $scope.userchat)


      var userRef = firebase.database().ref('user/jobber/' + $scope.firebaseUser)
      userRef.on('value', function (snap) {
        $scope.usercurent = snap.val();
      })
      $scope.formId = $stateParams.chatId;
      console.log("Sign-in provider: ", $scope.formId);
      var db = firebase.database();
      var ref = db.ref('user/employer/' + $scope.formId);
      $scope.newref = ref.child("newmessage");

// Attach an asynchronous callback to read the data at our posts reference
      ref.on("value", function (snapshotc) {
        console.log("this" + snapshotc.val());
        $scope.fromdata = snapshotc.val();

      }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
      });

// we add chatMessages array to the scope to be used in our ng-repeat
      $scope.messages = chatMessages;
      $timeout(function () {
        viewScroll.scrollBottom();
      }, 2000);
    }

    $scope.$back = function () {
      window.history.back();
    };

    $scope.timeConverter = function (timestamp) {
      var a = new Date(timestamp);
      var months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = hour + ' : ' + min + ' ' + date + '/' + month + '/' + year;
      return time;
    }


//xóa new message
// Get a database reference to our posts
    var db = firebase.database();
    var meref = db.ref('user/jobber/' + $scope.firebaseUser);
    $scope.listnewref = meref.child("newmessage");

// Attach an asynchronous callback to read the data at our posts reference
    $scope.listnewref.on("value", function (snapshotc) {
      $scope.listnew = snapshotc.val();
      console.log($scope.listnew);
      for (var obj in $scope.listnew) {
        var value = $scope.listnew[obj];
        if (value.from && cardid == value.from) {
          $scope.count++;

        }

      }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    $scope.clearnewmes = function () {
      var myRef = firebase.database().ref('newmessages/' + $scope.firebaseUser);
      myRef.transaction(function (post) {

        if (post && post[$scope.formId]) {
          post[$scope.formId] = null;
        }
        return post;
      });
    }
    $scope.addMessage = function () {
      var usersRef = firebase.database().ref('newmessages/' + $scope.formId);
      usersRef.transaction(function (post) {

        if (post && post[$scope.firebaseUser]) {
          post[$scope.firebaseUser]++
        } else {
          if (!post) {
            post = {};
          }
          post[$scope.firebaseUser] = 1;
          console.log("done", $scope.firebaseUser);
        }

        return post;
      });
      // calling $add on a synchronized array is like Array.push(),
      // except that it saves the changes to our database!
      $scope.messages.$add({
        from: $scope.firebaseUser,
        to: $scope.formId,
        text: $scope.newMessageText,
        timestamp: firebase.database.ServerValue.TIMESTAMP

      });

      // push noti

      FCMPlugin.subscribeToTopic('all'); //subscribe current user to topic
      var toTokenRef = firebase.database().ref('token/' + $scope.formId);
      toTokenRef.on('value', function (snap) {
        $scope.toToken = snap.val()
      });
      var fcm_server_key = "AAAArk3qIB4:APA91bEWFyuKiFqLt4UIrjUxLbduQCWJB4ACptTtgAovz4CKrMdonsS3jt06cfD9gGOQr3qtymBmKrsHSzGhqyJ_UWrrEbA4YheznlqYjsCBp_12bNPFSBepqg_qrxwdYxX_IcT9ne5z6s02I2mu2boy3VTN3lGPYg";

      $http({
        method: "POST",
        dataType: 'jsonp',
        headers: {'Content-Type': 'application/json', 'Authorization': 'key=' + fcm_server_key},
        url: "https://fcm.googleapis.com/fcm/send",
        data: JSON.stringify(
          {
            "notification": {
              "title": "Tin nhắn mới ",  //Any value
              "body": $scope.fromdata.name +": "+ $scope.newMessageText,  //Any value
              "sound": "default", //If you want notification sound
              "click_action": "FCM_PLUGIN_ACTIVITY",  //Must be present for Android
              "icon": "fcm_push_icon"  //White icon Android resource
            },
            "data": {
              "param1":'#/schats/'+ $scope.firebaseUser,  //Any data to be retrieved in the notification callback
              "param2": "fromSeeker"
            },
            "to": $scope.toToken.tokenId, //Topic or single device
            "priority": "high", //If not set, notification won't be delivered on completely closed iOS app
            "restricted_package_name": "" //Optional. Set for application filtering
          }
        )
      }).success(function (data) {
        $scope.reply = $scope.newMessageText;
        console.log("Success: " + JSON.stringify(data));
      }).error(function (data) {
        console.log("Error: " + JSON.stringify(data));
      });
      // reset the message input
      $scope.newMessageText = "";
      $ionicScrollDelegate.$getByHandle('userMessageScroll').scrollBottom();
    };

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');

    $scope.onMessageHold = function (e, itemIndex, message) {
      console.log('onMessageHold');
      console.log('message: ' + JSON.stringify(message, null, 2));
      $ionicActionSheet.show({
        buttons: [{
          text: 'Copy Text'
        }, {
          text: 'Delete Message'
        }],
        buttonClicked: function (index) {
          switch (index) {
            case 0: // Copy Text
              //cordova.plugins.clipboard.copy(message.text);

              break;
            case 1: // Delete
              // no server side secrets here :~)
              $scope.messages.splice(itemIndex, 1);
              $timeout(function () {
                viewScroll.resize();
              }, 0);

              break;
          }

          return true;
        }
      });
    };
// I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function (e, ta) {
      console.log('taResize');
      if (!ta) return;

      var taHeight = ta[0].offsetHeight;
      console.log('taHeight: ' + taHeight);

      if (!footerBar) return;

      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px';
    });
    var footerBar; // gets set in $ionicView.enter
    var scroller;
  }
  ])

