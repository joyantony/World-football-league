//Module

var footballApp = angular.module('footballApp', ['ngRoute', 'ngAnimate']);

//Routes
footballApp.config(function ($routeProvider){

	$routeProvider

	.when ('/', {
		templateUrl: 'views/main.htm',
		controller: 'mainController'
	})
	.when('/fixture', {
		templateUrl: 'views/fixture.htm',
		controller: 'fixtureController'
	})

	.otherwise({
			redirectTo: '/'
	});

});

//api key
var myApiKey = 'xx* Your api key *xx';

//Factory
footballApp.factory('seasonsFactory', ['$http', function( $http ){

	return {
		fullSeason: function(_params){

			return $http({
					method: 'GET',
					url: 'http://api.football-data.org/v1/competitions/',
					params: _params,
					headers: {
						'X-Auth-Token': myApiKey
					}
				}).success(function(result){
					return result;
			});
		}
	}

}]);

footballApp.factory('seasonFactory', ['$http', function( $http ){

	return{
		seasonById: function(_params){

			return $http({
					method: 'GET',
					url: 'http://api.football-data.org/v1/competitions/' + _params.id,
					headers: {
						'X-Auth-Token': myApiKey
					}
				}).success(function(result){
					return result;
			});
		}
	}

}]);

footballApp.factory('fixtureFactory', ['$http', function($http){

	return{
		getFixture: function(_params){
			return $http({
					method: 'GET',
					url: 'http://api.football-data.org/v1/competitions/' + _params.id + '/fixtures',
					headers: {
						'X-Auth-Token': myApiKey
					}				
				}).success(function(result){
					return result;
			});
		}
	}

}]);

footballApp.factory('tableFactory', ['$http', function($http){

	return{
		getLeagueTable: function(_params){
			return $http({
					method: 'GET',
					url: 'http://api.football-data.org/v1/competitions/' + _params.id + '/leagueTable',
					headers: {
						'X-Auth-Token': myApiKey
					}				
				}).success(function(result){
					return result;
			});
		}
	}

}]);

//Services
footballApp.service('fixtureServices', function(){

	this.leagueId = {id: 445, caption: "Premier League 2017/18"};

});

footballApp.service('matchdayServices', function(){

	this.matchDay = 1;
});

//Controllers
footballApp.controller('mainController', ['$scope', 'seasonsFactory', 'fixtureServices',  function($scope, seasonsFactory, fixtureServices){

	$scope.leagueId = fixtureServices.leagueId;
	

	$scope.$watch('leagueId', function(){

		fixtureServices.leagueId = $scope.leagueId;

	});


	seasonsFactory.fullSeason({
							season: '2017'
						}).then(function(result){
							//check the api before filtering the first index!
							//result.data.shift();
							$scope.leagues = result.data;
						});
	
}]);

footballApp.controller('fixtureController', ['$scope', '$filter', 'seasonFactory', 'fixtureFactory', 'fixtureServices', 'matchdayServices', 'tableFactory', function($scope, $filter, seasonFactory, fixtureFactory, fixtureServices, matchdayServices, tableFactory){

	$scope.leagueId = fixtureServices.leagueId;
	
	
	seasonFactory.seasonById({
				id: $scope.leagueId.id
				}).then(function(result){
		$scope.currentMatchday = result.data.currentMatchday;
	});

	tableFactory.getLeagueTable({
		id: $scope.leagueId.id
		}).then(function(result){
			$scope.leagueTables = result.data.standing;
	});

	fixtureFactory.getFixture({
				id: $scope.leagueId.id,
				}).then(function(result){
		$scope.fixtures = result.data.fixtures;
		var lastMatch = result.data.fixtures[result.data.fixtures.length-1];
		$scope.lastMatchDay = lastMatch.matchday;


		$scope.currentRound = function(matchRound){
			$scope.nextIsDisabled = false;
			$scope.preIsDisabled = false;
			$scope.currentFixtures = $filter('filter')($scope.fixtures, function(fil){
				return fil.matchday === $scope.currentMatchday;
			});
			$scope.matchDay = $scope.currentFixtures[0].matchday;
		}

		$scope.currentRound($scope.currentMatchday);
		

		$scope.preRound = function(matchRound){
			$scope.nextIsDisabled = false;
			$scope.preIsDisabled = false;
			$scope.preMatchday = matchRound - 1;
			$scope.currentFixtures = $filter('filter')($scope.fixtures, function(fil){
				return fil.matchday === $scope.preMatchday;
			});
			$scope.matchDay = $scope.currentFixtures[0].matchday;

			if($scope.matchDay === 1){
				$scope.preIsDisabled = true;
			}
		}

		$scope.nextRound = function(matchRound){
			$scope.preIsDisabled = false;
			$scope.nextIsDisabled = false;
			$scope.nextMatchday = matchRound + 1;
			$scope.currentFixtures = $filter('filter')($scope.fixtures, function(fil){
			return fil.matchday === $scope.nextMatchday;
			});
			$scope.matchDay = $scope.currentFixtures[0].matchday;
			
			if($scope.matchDay === $scope.lastMatchDay){
				$scope.nextIsDisabled = true;
			}
		}

	},function(error){
		$scope.errorMsg = error;
	});

}]);
