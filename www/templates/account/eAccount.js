'use strict';
app.controller("eAccountCtrl", function ($scope, $ionicModal, $http, $ionicLoading,$state,$cordovaSocialSharing) {
  $ionicLoading.show({
    template: '<ion-spinner class="spinner-positive"></ion-spinner>'
  });
  var uid = firebase.auth().currentUser.uid;
  $scope.uid = firebase.auth().currentUser.uid;
  console.log('im', $scope.uid)
  var userRef = firebase.database().ref('user/employer/' + uid)
  userRef.on("value", function (snapshot) {
    $scope.usercurent = snapshot.val();
    console.log('im', $scope.usercurent)
    $ionicLoading.hide()

  })
  $scope.editname = function () {
    $ionicModal.fromTemplateUrl('templates/modals/eeditname.html', {
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
          name: user.name
        });
        $scope.modalSettings.hide();
      };


      $scope.hideeditdes = function () {

        $scope.modalSettings.hide();
      }
    });
  };

  $scope.editaddress = function () {
    $ionicModal.fromTemplateUrl('templates/modals/eeditaddress.html', {
      scope: $scope,
      animation: 'slide-in-up',
      hideDelay: 920
    }).then(function (modal) {
      $scope.modalSettings = modal;
      $scope.modalSettings.show();

      var uid = firebase.auth().currentUser.uid;
      var usersRef = firebase.database().ref("user").child('employer/' + uid);


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
          var r = response;


          $scope.ketquas = response.data.results
          console.log($scope.ketquas)
          var user = firebase.auth().currentUser;
          var db = firebase.database();
          var ref = db.ref();
          var uid = firebase.auth().currentUser.uid;
          var usersRef = ref.child('/user/employer/' + uid + '/location');
          var refdis = ref.child('user/jobber/')
          refdis.on("value", function (snap) {
            console.log(snap.val())
            $scope.datadis = snap.val();

          })
          $scope.saveaddress = function () {
            $ionicLoading.show({
              template: '<ion-spinner class="spinner-positive"></ion-spinner>'
            });

            console.log($scope.address);
            usersRef.update({
              address: $scope.address.formatted_address,
              location: {
                lat: $scope.address.geometry.location.lat,
                lng: $scope.address.geometry.location.lng,
              }
            });

            $ionicLoading.hide()
            $scope.modalSettings.hide();

          }


          $scope.newHospital = {};

        })

      }

      $scope.hideeditdes = function () {

        $scope.modalSettings.hide();
      }
    });

  };
  $scope.share = function () {
    $cordovaSocialSharing
      .shareViaFacebook("Tuyển nhân viên nhanh chóng và hiệu quả!", "", 'https://www.facebook.com/jobovietnam')
      .then(function (result) {
        // Success!
      }, function (err) {
        // An error occurred. Show a message to the user
      });

  }
  // to logout
  $scope.doLogout = function () {

    firebase.auth().signOut().then(function () {
      // Sign-out successful.
      console.log("Logout successful");
      $state.go("login");

    }, function (error) {
      // An error happened.
      console.log(error);
    });

  };


})

