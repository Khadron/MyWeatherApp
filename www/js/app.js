angular.module('App', ['ionic'])

.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('search', {
    url: '/search',
    controller: 'SearchController',
    templateUrl: 'views/search/search.html'
  })
  .state('settings', {
    url: '/settings',
    controller: 'SettingsController',
    templateUrl: 'views/settings/settings.html'
  })
  .state('weather', {
    url: '/weather/:city/:lat/:lng',
    controller: 'WeatherController',
    templateUrl: 'views/weather/weather.html'
  });

  $urlRouterProvider.otherwise('/search');
})


.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('LeftMenuController', function ($scope, Locations) {
  $scope.locations = Locations.data;
})

.filter('timezone', function () {
  return function (input, timezone) {
    if (input && timezone) {
      var time = moment.tz(input * 1000, timezone);
      return time.format('LT');
    }
    return '';
  };
})

.filter('icons', function () {
  var map = {
    '晴': 'ion-ios-sunny',
    'clear-night': 'ion-ios-moon',
    '雨': 'ion-ios-rainy',
    '阵雨': 'ion-ios-rainy',
    '雷阵雨': 'ion-ios-thunderstorm',
    '小雨': 'ion-ios-rainy',
    '中雨': 'ion-ios-rainy',
    '大雨': 'ion-ios-rainy',
    '小雪': 'ion-ios-snowy',
    '大雪': 'ion-ios-snowy',
    '雪': 'ion-ios-snowy',
    '雨夹雪': 'ion-ios-snowy',
    '风': 'ion-ios-flag',
    '雾': 'ion-ios-cloud',
    '阴': 'ion-ios-cloudy',
    '多云': 'ion-ios-partlysunny',
    'partly-cloudy-night': 'ion-ios-cloudy-night'
  };
  return function (icon) {
    return map[icon] || '';
  }
})

.factory('Settings', function () {
  var Settings = {
    units: 'us',
    days: 5
  };
  return Settings;
})

.factory('Locations', function ($ionicPopup) {
  var Locations = {
    data: [{
      city: '北京',
      lat: 40,
      lng: 116
    }],
    getIndex: function (item) {
      var index = -1;
      angular.forEach(Locations.data, function (location, i) {
        if (item.city == location.city ) {
          index = i;
        }
      });
      return index;
    },
    toggle: function (item) {
      var index = Locations.getIndex(item);
      if (index >= 0) {
        $ionicPopup.confirm({
          title: '确定要这样做吗？',
          template: '将会移除' + Locations.data[index].city
        }).then(function (res) {
          if (res) {
            Locations.data.splice(index, 1);
          }
        });
      } else {
        Locations.data.push(item);
        $ionicPopup.alert({
          title: '保存城市'
        });
      }
    },
    primary: function (item) {
      var index = Locations.getIndex(item);
      if (index >= 0) {
        Locations.data.splice(index, 1);
        Locations.data.splice(0, 0, item);
      } else {
        Locations.data.unshift(item);
      }
    }
  };

  return Locations;
})

.factory('CityListService', function () {
  return [
  "北京",
  "广州",
  "上海",
  "天津",
  "重庆",
  "沈阳",
  "南京",
  "武汉",
  "成都",
  "西安",
  "石家庄",
  "太原",
  "郑州",
  "长春",
  "哈尔滨",
  "呼和浩特",
  "济南",
  "合肥",
  "杭州",
  "福州",
  "长沙",
  "南宁",
  "南昌",
  "贵阳",
  "昆明",
  "拉萨",
  "海口",
  "兰州",
  "银川",
  "西宁",
  "乌鲁木齐",
  "香港",
  "澳门",
  "台北"
  ];

})
.factory('LD', function () {

  var LD = {
    similarity:function(s1,s2){
      var n = s1.length;
      var m = s2.length;
      var i,j;

      if(n==0 || m == 0)
        return 0;

      var matrix = new Array(n+1); //初始化矩阵
      for(var s = 0;s < n+1;s++) 
      { 
        matrix[s] = new Array(m+1);
      }

      for (i = 0; i <= n; i++) {
        matrix[i][0] = i;
      }

      for (j=0; j <= m; j++) {
        matrix[0][j] = j;
      }

      for ( i = 1; i <= n; i++) {
        var c1 = s1[i-1];

        for (j = 1; j <= m; j++) {

          var c2 = s2[j-1];
          var sub = c1 === c2 ? 0:1;

          var deletion = matrix[i-1][j] + 1;
          var inserttion = matrix[i][j-1] + 1;
          var substitution = matrix[i-1][j-1] + sub;

          var min = Math.min(deletion,inserttion);
          matrix[i][j] = Math.min(min,substitution);
        }
      }

      return 1 - matrix[n][m]/Math.max(s1.length,s2.length);
    }
  }
  return LD;
})

.factory('Geolocation',function($ionicPopup,$http,Locations){

  var geolocation = {
    isSupport:function(){ return navigator.geolocation;},
    location:function(fn){

      navigator.geolocation.getCurrentPosition(function(position){

       var latitude  = position.coords.latitude;
       var longitude = position.coords.longitude;

       $http.get('/api/geoloaction/', {params: {
        ak: '3oEYlF3kwbsSr2miOmFiI0sNW7pnaixK',
        location: latitude + "," + longitude,
        output: 'json'
      }}).success(function (obj) {
        if(obj == null || obj.status != 0){
          return;
        }
        var city=obj.result.addressComponent.city;
        $ionicPopup.confirm({
          title:'当前位置：'+city+'?'
        }).then(function(res){
          if(res){
           Locations.data = {
            city: city,
            lat: latitude,
            lng: longitude
          };

          fn(city);
        }});
      }).error(function(error){
        console.log(error);
      });

    }, function(error){

     $ionicPopup.alert({title:'无法获取您的位置'});
   });
    }
  }
  return geolocation;

});
