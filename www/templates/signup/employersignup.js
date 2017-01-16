"use strict";
app.controller('esignupController', ['$scope', '$state', '$document', '$firebaseArray', '$ionicSlideBoxDelegate', '$ionicActionSheet', '$http', '$cordovaCamera', '$rootScope', '$ionicLoading', '$cordovaToast', '$ionicPlatform', '$ionicPopup', '$ionicHistory',
  function ($scope, $state, $document, $firebaseArray, $ionicSlideBoxDelegate, $ionicActionSheet, $http, $cordovaCamera, $rootScope, $ionicLoading, $cordovaToast, $ionicPlatform, $ionicPopup, $ionicHistory) {
    $ionicPlatform.registerBackButtonAction(function () {
      if ($scope.slideIndex) {
        $ionicSlideBoxDelegate.previous();
      } else {
        $ionicHistory.goBack();

      }
    }, 100);

    $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    };
    $scope.next = function () {
      $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function () {
      $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function (index) {
      $scope.slideIndex = index;
      console.log($scope.slideIndex)
    };
    $scope.doSignup = function (userSignup) {
      $rootScope.registering = true;

      $ionicLoading.show({
        template: '<ion-spinner class="spinner-positive"></ion-spinner>'
      });
      firebase.auth().createUserWithEmailAndPassword(userSignup.cusername, userSignup.cpassword).then(function () {


        var user = firebase.auth().currentUser;
        var db = firebase.database();
        var ref = db.ref("user");
        var uid = firebase.auth().currentUser.uid;
        var usersRef = ref.child('employer/' + uid);
        usersRef.update({
          type: "employer",
          userid: uid,
          email: userSignup.cusername,
          photourl: "https://cdn0.iconfinder.com/data/icons/e-commerce-and-shopping-2/512/shop_store_market_shopping_cafe_retail_sale_trading_trade_products_commerce_marketplace_bar_bistro_grocery_building_service_business_flat_design_icon-512.png",
          starCount: 0,
          stars: {start: "start"},
          disstarCount: 0,
          disstars: {start: "start"},
          interest: {distance: "40"},
          dateCreated: firebase.database.ServerValue.TIMESTAMP
        });
        console.log("create username successful");
        $ionicLoading.hide();

        $ionicSlideBoxDelegate.next();


      }, function (error) {
        $ionicLoading.hide();

        // An error happened.
        var errorCode = error.code;
        console.log(errorCode);

        if (errorCode === 'auth/weak-password') {
          $cordovaToast.showShortTop('Mật khẩu yếu, hãy chọn mật khẩu dài hơn');
          return false;
        } else if (errorCode === 'auth/email-already-in-use') {
          $ionicSlideBoxDelegate.previous();

          $cordovaToast.showShortTop('Email này đã được sử dụng, hãy chọn email khác');

          return false;
        }


      });


    };// end $scope.doSignup()


    $scope.doUpdate = function (userSignup) {
      console.log(userSignup);
      $ionicSlideBoxDelegate.next();
    };
    $scope.Update = function (userSignup) {
      console.log(userSignup);
      var user = firebase.auth().currentUser;
      var db = firebase.database();
      var ref = db.ref("user");
      var uid = firebase.auth().currentUser.uid;
      var usersRef = ref.child('employer/' + uid);
      usersRef.update({
        name: userSignup.displayname,
        phone: userSignup.phone,
        userid: uid,
        industry: userSignup.industry
      });
      console.log("Signupp ok");
      $ionicSlideBoxDelegate.next();
    };


    $scope.autocomplete = {text: ''};
    $scope.searchresult = {text: ''};
    $scope.setSelectedAddress = function (selectedAddress) {
      $scope.address = selectedAddress;
    };

    $scope.search = function () {

      $scope.URL = 'https://maps.google.com/maps/api/geocode/json?address=' + $scope.autocomplete.text + '&components=country:VN&sensor=true&key=AIzaSyCly7S-AaWT0UD7eLI2cKq6-DfhS4ex6zc&callback=JSON_CALLBACK';
      $http({
        method: 'GET',
        url: $scope.URL
      }).then(function successCallback(response) {

        $scope.ketquas = response.data.results;
        console.log($scope.ketquas);
        var user = firebase.auth().currentUser;
        var db = firebase.database();
        var ref = db.ref();
        var uid = firebase.auth().currentUser.uid;
        var usersRef = ref.child('/user/employer/' + uid + '/location');
        $scope.saveaddress = function () {

          $ionicLoading.show({
            template: '<ion-spinner class="spinner-positive"></ion-spinner>'
          });
          usersRef.update({
            address: $scope.address.formatted_address,
            location: {
              lat: $scope.address.geometry.location.lat,
              lng: $scope.address.geometry.location.lng
            }
          });
          $ionicLoading.hide();
          $scope.next();
        }

      })

    };

    $scope.updateavatar = function () {
      console.log('update avatar clicked');
      $ionicActionSheet.show({
        buttons: [{
          text: 'Chụp ảnh'
        }, {
          text: 'Chọn từ thư viện'
        }],
        cancelText: 'Cancel',
        cancel: function () {
        },
        buttonClicked: function (index) {
          switch (index) {

            case 0:
              var options = {
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                targetWidth: 500,
                targetHeight: 500,
                saveToPhotoAlbum: false,
                allowEdit: true

              };
              $cordovaCamera.getPicture(options).then(function (imageData) {
                $ionicLoading.show({
                  template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                });
                // $scope.images = imageData;

                var storageRef = firebase.storage().ref();
                // filename = imageData.name;

                var getFileBlob = function (url, cb) {
                  var xhr = new XMLHttpRequest();
                  xhr.open("GET", url);
                  xhr.responseType = "blob";
                  xhr.addEventListener('load', function () {
                    cb(xhr.response);
                  });
                  xhr.send();
                };

                var blobToFile = function (blob, name) {
                  blob.lastModifiedDate = new Date();
                  blob.name = name;
                  return blob;
                };

                var getFileObject = function (filePathOrUrl, cb) {
                  getFileBlob(filePathOrUrl, function (blob) {
                    cb(blobToFile(blob, new Date().getTime()));
                  });
                };

                getFileObject(imageData, function (fileObject) {
                  var metadata = {
                    'contentType': fileObject.type
                  };
                  var uploadTask = storageRef.child('images/' + fileObject.name).put(fileObject, metadata);

                  uploadTask.on('state_changed', null, function (error) {
                    // [START onfailure]
                    console.error('Upload failed:', error);
                    alert('Upload failed:', error);
                    // [END onfailure]
                  }, function () {
                    console.log(uploadTask.snapshot.metadata);
                    var url = uploadTask.snapshot.metadata.downloadURLs[0];
                    var db = firebase.database();
                    var ref = db.ref("user");
                    var uid = firebase.auth().currentUser.uid;
                    var usersRef = ref.child('employer/' + uid);
                    usersRef.update({
                      photourl: url
                    });
                    $cordovaToast.showShortTop("Cập nhật ảnh thành công");
                    $ionicLoading.hide();
                    $scope.next()

                  });

                });
              }, function (error) {
                console.error(error);
                alert(error);
              });


              break;
            case 1: // chọn pickercordova plugin add https://github.com/wymsee/cordova-imagePicker.git
              var options = {
                quality: 75,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                targetWidth: 500,
                targetHeight: 500,
                saveToPhotoAlbum: false,
                allowEdit: true
              };
              $cordovaCamera.getPicture(options).then(function (imageData) {

                $ionicLoading.show({
                  template: '<p>Loading...</p><ion-spinner></ion-spinner>'
                });
                var storageRef = firebase.storage().ref();
                // filename = imageData.name;

                var getFileBlob = function (url, cb) {
                  var xhr = new XMLHttpRequest();
                  xhr.open("GET", url);
                  xhr.responseType = "blob";
                  xhr.addEventListener('load', function () {
                    cb(xhr.response);
                  });
                  xhr.send();
                };

                var blobToFile = function (blob, name) {
                  blob.lastModifiedDate = new Date();
                  blob.name = name;
                  return blob;
                };

                var getFileObject = function (filePathOrUrl, cb) {
                  getFileBlob(filePathOrUrl, function (blob) {
                    cb(blobToFile(blob, new Date().getTime()));
                  });
                };

                getFileObject(imageData, function (fileObject) {

                  var metadata = {
                    'contentType': fileObject.type
                  };
                  var uploadTask = storageRef.child('images/' + fileObject.name).put(fileObject, metadata);

                  uploadTask.on('state_changed', null, function (error) {
                    // [START onfailure]
                    console.error('Upload failed:', error);
                    alert('Upload failed:', error);
                    // [END onfailure]
                  }, function () {
                    console.log(uploadTask.snapshot.metadata);
                    var url = uploadTask.snapshot.metadata.downloadURLs[0];
                    var db = firebase.database();
                    var ref = db.ref("user");
                    var uid = firebase.auth().currentUser.uid;
                    var usersRef = ref.child('employer/' + uid);
                    usersRef.update({
                      photourl: url
                    });
                    $ionicLoading.hide();
                    $scope.next()
                  });

                });
              }, function (error) {
                console.error(error);
                $cordovaToast.showShortTop("Cập nhật ảnh thành công");
              });

              break;
          }

          return true;
        }
      });
    };
    $scope.newHospital = {};
    $scope.showjob = function () {
      $ionicPopup.confirm({
        title: 'Vị trí bạn đang cần tuyển',
        scope: $scope,
        // template: 'Are you sure you want to eat this ice cream?',
        templateUrl: 'templates/popups/collect-job.html',
        cssClass: 'animated bounceInUp dark-popup',
        okType: 'button-small button-calm bold',
        okText: 'Done',
        cancelType: 'button-small'
      }).then(function (res) {
        if (res) {
          for (var obj in $scope.newHospital.job) {
            $scope.keyjob = $scope.newHospital.job[obj];
            console.log('obj', $scope.keyjob);
            if ($scope.keyjob == false) {
              delete $scope.newHospital.job[obj];
            }
          }
          console.log('You are sure', $scope.newHospital);

        } else {
          console.log('You are not sure');
        }
      });
    };

    $scope.saveinterestjob = function () {

      var uid = firebase.auth().currentUser.uid;
      var savejobRef = firebase.database().ref("user").child('employer/' + uid + '/interest');
      console.log($scope.newHospital);
      savejobRef.set($scope.newHospital);
      $scope.next();
    };
  }]);
