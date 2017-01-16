"use strict";
app.controller("eprofileCtrl", function ($scope, $rootScope,
                                         $ionicActionSheet,
                                         $ionicSlideBoxDelegate,
                                         $cordovaCamera,
                                         $ionicModal,
                                         $http,
                                         $ionicLoading
  , $ionicPopup) {
  $scope.init = function () {

    var uid = firebase.auth().currentUser.uid;
    $scope.uid = firebase.auth().currentUser.uid;
    console.log('im', $scope.uid);
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-positive"></ion-spinner>'
    });
    var userRef = firebase.database().ref('user/employer/' + uid);
    userRef.on("value", function (snapshot) {
      $ionicLoading.hide();
      $scope.usercurent = snapshot.val();
      console.log('im', $scope.usercurent)

    });
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
                  // [END onfailure]
                }, function () {
                  console.log(uploadTask.snapshot.metadata);
                  var url = uploadTask.snapshot.metadata.downloadURLs[0];
                  var usersRef = firebase.database().ref('user/employer/' + $scope.uid);
                  usersRef.update({
                    photourl: url
                  });
                  $ionicLoading.hide()
                });

              });
            }, function (error) {
              console.error(error);
              $cordovaToast(error);
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
                  $cordovaToast('Upload failed:', error);
                  // [END onfailure]
                }, function () {
                  console.log(uploadTask.snapshot.metadata);
                  var url = uploadTask.snapshot.metadata.downloadURLs[0];
                  var user = firebase.auth().currentUser;
                  var db = firebase.database();
                  var ref = db.ref("user");
                  var uid = firebase.auth().currentUser.uid;
                  var usersRef = ref.child('employer/' + uid);
                  usersRef.update({
                    photourl: url
                  })

                });
                $ionicLoading.hide()
              });
            }, function (error) {
              console.error(error);
              $cordovaToast(error);
            });

            break;
        }

        return true;
      }
    });
  };
  var uid = firebase.auth().currentUser.uid;
  var usersRef = firebase.database().ref('user/employer/' + uid + '/interest');

  $scope.createHospital = function () {

    console.log($scope.newHospital);
    usersRef.update($scope.newHospital);
  };

  $scope.newHospital = {};


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
      var ref = db.ref("user");
      var uid = firebase.auth().currentUser.uid;
      var usersRef = ref.child('employer/' + uid + '/location');
      var refdis = ref.child('jobber/');
      refdis.on("value", function (snap) {
        console.log(snap.val());
        $scope.datadis = snap.val();

      });
      $scope.doUpdate = function (user) {
        var userchild = ref.child('employer/' + uid);
        userchild.update({
          name: user.name,
          description: user.description,
          industry: user.industry.text
        });
        $scope.createHospital();
        saveaddress();

      };
      function saveaddress() {


        console.log($scope.address);
        usersRef.update({
          address: $scope.address.formatted_address,
          location: {
            lat: $scope.address.geometry.location.lat,
            lng: $scope.address.geometry.location.lng
          }
        });
        var obj = $scope.datadis;
        var arr = Object.keys(obj).map(function (key) {
          return obj[key];
        });
        console.log(arr);
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].location) {

            console.log(arr[i].location.location);
            var lat1 = $scope.address.geometry.location.lat;
            var lon1 = $scope.address.geometry.location.lng;
            var lat2 = arr[i].location.location.lat;
            var lon2 = arr[i].location.location.lng;
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
            console.log(x);
            var disref = ref.child('employer/' + uid + '/location/distance/' + arr[i].userid);

            disref.update({
              dis: x,
              uid: arr[i].userid
            });
            var meref = ref.child('jobber/' + arr[i].userid + '/location/distance/' + uid);

            meref.update({
              dis: x,
              uid: uid
            })
          }

        }
        function deg2rad(deg) {
          return deg * (Math.PI / 180)
        }

      }


      $scope.newHospital = {};

    })

  };

  $scope.editjob = function () {
    $scope.newHospital = {};
    $ionicPopup.confirm({
      title: 'Vị trí',
      scope: $scope,
      // template: 'Are you sure you want to eat this ice cream?',
      templateUrl: 'templates/popups/collect-job.html',
      cssClass: 'animated bounceInUp dark-popup',
      okType: 'button-small button-calm bold',
      okText: 'Xong ',
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

        var uid = firebase.auth().currentUser.uid;
        var usersRef = firebase.database().ref("user").child('employer/' + uid + '/interest');
        usersRef.update($scope.newHospital);


      } else {
        console.log('You are not sure');
      }

    });
  };
  $scope.editjobdes = function () {
    $ionicModal.fromTemplateUrl('templates/modals/editdescription.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalSettings = modal;
      $scope.modalSettings.show();

      var uid = firebase.auth().currentUser.uid;
      var usersRef = firebase.database().ref("user").child('employer/' + uid);

      $scope.savejobdes = function (user) {
        usersRef.update({
          description: user.description
        });
        $scope.modalSettings.hide();

      };


      $scope.hideeditdes = function () {

        $scope.modalSettings.hide();
      }
    });
  };

});
