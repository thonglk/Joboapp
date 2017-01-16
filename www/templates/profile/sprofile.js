"use strict";

app.controller("sprofileCtrl", function ($scope,
                                         $ionicActionSheet,
                                         $ionicSlideBoxDelegate,
                                         $cordovaCamera,
                                         $ionicModal,
                                         $http,
                                         $cordovaCapture,
                                         $cordovaToast,
                                         $sce,
                                         $firebaseArray,
                                         $ionicLoading,
                                         $ionicPopup) {


  $scope.init = function () {
    var uid = firebase.auth().currentUser.uid;
    $scope.uid = firebase.auth().currentUser.uid;
    console.log('im', $scope.uid);
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-positive"></ion-spinner>'
    });
    var userRef = firebase.database().ref('user/jobber/' + uid);
    userRef.on("value", function (snapshot) {
      $ionicLoading.hide();
      $scope.usercurent = snapshot.val();
      $scope.birthdate = snapshot.val().birth


    })

  };

  $scope.calculatemonth = function calculatemonth(birthday) { // birthday is a date
    var birthdate = new Date(birthday);
    var month = birthdate.getMonth() + 1;
    var year = birthdate.getFullYear();
    var time = month + "/" + year;

    return time;
  };
  $scope.calculateAge = function calculateAge(birthday) { // birthday is a date
    var birthdate = new Date(birthday);
    var ageDifMs = Date.now() - birthdate;
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
                  var usersRef = firebase.database().ref('user/jobber/' + $scope.uid);
                  usersRef.update({
                    photourl: url
                  });
                  $ionicLoading.hide()

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
                  var usersRef = ref.child('jobber/' + uid);
                  usersRef.update({
                    photourl: url
                  });
                  $ionicLoading.hide()
                });

              });
            }, function (error) {
              console.error(error);
              $cordovaToast.showShortTop(error);
            });

            break;
        }

        return true;
      }
    });
  };
  $scope.addjob = function () {
    $ionicModal.fromTemplateUrl('templates/modals/add-job.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalProfile = modal;
      $scope.modalProfile.show();

      $scope.showjob = function () {
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
            console.log('You are sure', $scope.newHospital);

          } else {
            console.log('You are not sure');
          }
        });
      };

      $scope.savejob = function (job) {


        var db = firebase.database();
        var ref = db.ref("user");
        var uid = firebase.auth().currentUser.uid;
        var newPostKey = firebase.database().ref("user").child('jobber/' + uid + '/jobhistory').push().key;

        var usersRef = ref.child('jobber/' + uid + '/jobhistory/' + newPostKey);

        usersRef.update({
          company: job.company,
          monthstart: job.monthstartselected,
          monthend: job.monthendselected,
          industry: job.industry,
          title: $scope.newHospital.job,
          key: newPostKey

        });
        $scope.modalProfile.hide();
        $cordovaToast.showShortTop("Đã thêm")


      };
      $scope.hideProfile = function () {
        $scope.modalProfile.hide();
      }
    });
  };
  $scope.captureVideo = function () {
    var options = {limit: 1, duration: 60};

    $cordovaCapture.captureVideo(options).then(function (mediaFiles) {
      $ionicLoading.show({
        template: '<p>Loading...</p><ion-spinner></ion-spinner>'
      });
      var i, imageData, len;
      for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        imageData = mediaFiles[i].fullPath;
        var storageRef = firebase.storage().ref();

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
          var uploadTask = storageRef.child('video/' + fileObject.name).put(fileObject, metadata);

          uploadTask.on('state_changed', null, function (error) {
            // [START onfailure]
            console.error('Upload failed:', error);
            $cordovaToast.showShortTop('Upload failed:', error);
            // [END onfailure]
          }, function () {
            console.log(uploadTask.snapshot.metadata);
            var url = uploadTask.snapshot.metadata.downloadURLs[0];
            var user = firebase.auth().currentUser;
            var db = firebase.database();
            var ref = db.ref("user");
            var uid = firebase.auth().currentUser.uid;
            var usersRef = ref.child('jobber/' + uid);
            usersRef.update({
              videourl: url
            });
            $ionicLoading.hide();
            $cordovaToast.showShortTop('Đã cập nhật video')

          });

        });
      }
      // Success! Video data is here

    }, function (err) {
      // An error occurred. Show a message to the user
    });
  };
  $scope.trustSrc = function (src) {
    return $sce.trustAsResourceUrl(src);
  };
  $scope.showinterest = function () {
    $ionicModal.fromTemplateUrl('templates/modals/edit-interest.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalSettings = modal;
      $scope.modalSettings.show();
      $scope.cancel = function () {
        $scope.modalSettings.hide();
      };

      $scope.showjob = function () {

        $ionicPopup.confirm({
          title: 'Lựa chọn vị trí mà bạn muốn ',
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

          } else {
            console.log('You are not sure');
          }
        });
      };

      var uid = firebase.auth().currentUser.uid;
      var usersRef = firebase.database().ref("user").child('jobber/' + uid + '/interest');
      usersRef.on('value', function (snap) {
        $scope.newHospital = snap.val();

      });
      $scope.createHospital = function () {
        for (var obj in $scope.newHospital.time) {
          $scope.keyjob = $scope.newHospital.time[obj];
          console.log('obj', $scope.keyjob);
          if ($scope.keyjob == false) {
            delete $scope.newHospital.time[obj];
          }
        }
        console.log($scope.newHospital);
        usersRef.set($scope.newHospital);
        $cordovaToast.showShortTop('Lưu!');
        usersRef.update({
          done: "true"
        });
        $scope.modalSettings.hide();
      };


    });
  };

  $scope.editschool = function () {
    $ionicModal.fromTemplateUrl('templates/modals/seditschool.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalSettings = modal;
      $scope.modalSettings.show();

      var uid = firebase.auth().currentUser.uid;
      var usersRef = firebase.database().ref("user").child('jobber/' + uid);

      $scope.savejobdes = function (user) {

        usersRef.update({
          school: user.school
        });
        $cordovaToast.showShortTop('Lưu!');

        $scope.modalSettings.hide();
      };


      $scope.hideeditdes = function () {

        $scope.modalSettings.hide();
      }
    });
  };
  $scope.editbirth = function () {
    $ionicModal.fromTemplateUrl('templates/modals/seditbirth.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalSettings = modal;
      $scope.modalSettings.show();

      var uid = firebase.auth().currentUser.uid;
      var usersRef = firebase.database().ref("user").child('jobber/' + uid);

      $scope.savejobdes = function (user) {
        usersRef.update({
          birth: user.birth
        });
        $cordovaToast.showShortTop('Lưu!');

        $scope.modalSettings.hide();
      };


      $scope.hideeditdes = function () {

        $scope.modalSettings.hide();
      }
    });
  };
  $scope.deletehistory = function (index) {
    console.log("de", index);
    var deletejobRef = firebase.database().ref('user/jobber/' + $scope.uid + '/jobhistory/' + index);
    deletejobRef.remove()
  }
});
