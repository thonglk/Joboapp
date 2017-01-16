"use strict";
app.controller('loginController', ['$scope', '$firebaseArray', 'CONFIG', '$document', '$state', '$cordovaInAppBrowser', '$ionicLoading', '$cordovaToast', '$ionicHistory', '$ionicPlatform', function ($scope, $firebaseArray, CONFIG, $document, $state, $cordovaInAppBrowser, $ionicLoading, $cordovaToast, $ionicHistory, $ionicPlatform) {
  $scope.$on('$ionicView.enter', function () {
    $ionicHistory.clearCache();
    console.log("clear");

  });
  $ionicPlatform.registerBackButtonAction(function () {
    $state.go('intro')
  }, 100);
  $scope.doLogin = function (userLogin) {
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-positive"></ion-spinner>'
    });

    console.log(userLogin);


    firebase.auth().signInWithEmailAndPassword(userLogin.username, userLogin.password).then(function () {

      var uid = firebase.auth().currentUser.uid;

      var userRef = firebase.database().ref('user/employer');
      userRef.on("value", function (snapshot) {
        $scope.employeruser = snapshot.val();
        console.log("list", $scope.employeruser);
        if ($scope.employeruser[uid]) {
          $state.go('edash')
        } else {
          $state.go('sdash')
        }


      });

      $ionicLoading.hide()

    }, function (error) {
      $ionicLoading.hide();

      // An error happened.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode);
      if (errorCode === 'auth/invalid-email') {
        $cordovaToast.showShortTop('Kiểm tra lại email.');
        return false;
      } else if (errorCode === 'auth/wrong-password') {
        $cordovaToast.showShortTop('Mật khẩu không đúng.');
        return false;
      } else if (errorCode === 'auth/argument-error') {
        $cordovaToast.showShortTop('Password must be string.');
        return false;
      } else if (errorCode === 'auth/user-not-found') {
        $cordovaToast.showShortTop('Email này không tồn tại.');
        return false;
      } else if (errorCode === 'auth/too-many-requests') {
        $cordovaToast.showShortTop('Too many failed login attempts, please try after sometime.');
        return false;
      } else if (errorCode === 'auth/network-request-failed') {
        $cordovaToast.showShortTop('Request timed out, please try again.');
        return false;
      } else {
        $cordovaToast(errorMessage);
        return false;
      }
    });


  };// end $scope.doLogin()

}])

  .controller('resetController', ['$scope', '$state', '$document', '$firebaseArray', 'CONFIG', '$cordovaToast', function ($scope, $state, $document, $firebaseArray, CONFIG, $cordovaToast) {

    $scope.doResetemail = function (userReset) {



      //console.log(userReset);

      if ($document[0].getElementById("ruser_name").value != "") {


        firebase.auth().sendPasswordResetEmail(userReset.rusername).then(function () {
          // Sign-In successful.
          //console.log("Reset email sent successful");

          $state.go("login");


        }, function (error) {
          // An error happened.
          var errorCode = error.code;
          console.log(errorCode);


          if (errorCode === 'auth/user-not-found') {
            $cordovaToast.showShortTop('Email này không đúng.');
            return false;
          } else if (errorCode === 'auth/invalid-email') {
            $cordovaToast.showShortTop('Email you entered is not complete or invalid.');
            return false;
          }

        });


      } else {

        $cordovaToast.showShortTop('Please enter registered email to send reset link');
        return false;

      }//end check client username password


    };// end $scope.doSignup()


  }])

  .controller('introController', function ($state, $scope, $ionicLoading, $rootScope, $ionicDeploy, $cordovaToast, $timeout, $ionicPopup) {
    firebase.database().ref('config').on('value', function (snap) {
      $scope.checkUpdate = snap.val().isShowUpdate;
      console.log($scope.checkUpdate);
      if ($scope.checkUpdate == 1) {
        $scope.updateversion()
      }
    });

    $scope.updateversion = function () {
      console.log("checking");
      $ionicDeploy.check().then(function (snapshotAvailable) {
        if (snapshotAvailable) {
          $ionicLoading.show({
            template: '<p>Đang cập nhật phiên bản mới...</p><ion-spinner></ion-spinner>'
          });
          $ionicDeploy.download().then(function () {
            $ionicDeploy.extract().then(function (process) {
              console.log("Process", process);
              $ionicLoading.hide();
              var alertPopup = $ionicPopup.alert({
                title: 'Đã cập nhật phiên bản mới',
                template: '<p style="text-align: center">Nhấn ok để làm mới</p>'
              });
              alertPopup.then(function (res) {
                $ionicDeploy.load();
              });
            });
          });
        }
      });

    }


    $timeout(getTheToken, 1000);

    function getTheToken() {
      FCMPlugin.getToken(
        function (token) {
          if (token) {
            $rootScope.tokenuser = token;
            console.log("I got the token: " + token);

          } else {
            console.log("null token");
            $timeout(getTheToken, 1000);

          }
        },
        function (err) {
          console.log('error retrieving token: ' + err);
        }
      );
    }


    $scope.deviceHeight = window.innerHeight;
    $scope.checkuser = function () {


      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner></ion-spinner>'
      });
      firebase.auth().onAuthStateChanged(function (user) {


        if (user && !$rootScope.registering) {
          var uid = firebase.auth().currentUser.uid;
          var userRef = firebase.database().ref('user/employer');
          userRef.once("value", function (snapshot) {
            $scope.employeruser = snapshot.val();
            console.log("list", $scope.employeruser);
            if ($scope.employeruser[uid]) {
              $state.go('edash')
            } else {
              $state.go('sdash')
            }

          });
          $ionicLoading.hide();
          $cordovaToast.showLongCenter("Đăng nhập thành công! Đang chuyển hướng...")
        } else {
          // No user is signed in.
          $ionicLoading.hide();

        }
      });

    }
  });
