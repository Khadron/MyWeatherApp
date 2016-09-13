angular.module('App')
.controller('SearchController', function ($scope, $http,CityListService,LD,Geolocation) {
	$scope.model = {cityName: ''};


	$scope.search = function () {
		var s1 = $scope.model.cityName;
		var arrs = [];
		for (var i = 0; i < CityListService.length; i++) {
			var s2 = CityListService[i]
			var d = LD.similarity(s1,s2);
			if(d >= 0.5){
				arrs.push({cityName:s2});
			}
		}

		$scope.results = arrs;

	};

	if(Geolocation.isSupport()){
		Geolocation.location(function(city){
			$scope.results = [{
				cityName:city
			}];

		});

		
	}

});
