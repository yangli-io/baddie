angular.module('baddie', ['ui.bootstrap', 'firebase'])
.controller('signup', function($scope, $http, $rootScope, data){

	$scope.show = true;

	if (window.localStorage.name){
		$scope.show = false;
		data.data.name = window.localStorage.name;
	} 
	$scope.signup = function(){
		if (!$scope.name){
			alert('no name!');
			return;
		}
		window.localStorage.name = $scope.name;
		data.data.name = $scope.name;
		$scope.show = false;
		$rootScope.$broadcast('signup');
		location.reload();
	}

	$scope.changeUsers = function(){
		window.localStorage.name = '';
		$rootScope.$broadcast('signup');
		$scope.show = true;
		location.reload();
	}
})
.controller('availability', function($scope, $http, $rootScope){
	$scope.name = window.localStorage.name;
	$http.get('https://baddie.firebaseio.com/date.json').then(function(response){ $scope.bookDate = response.data });

	$scope.dataModel = {
		saturday: {
			'3pm': 'no',
			'4pm': 'no',
			'5pm': 'no',
			'6pm': 'no',
			'7pm': 'no',
			'8pm': 'no',
			'9pm': 'no',
		},
		sunday: {
			'3pm': 'no',
			'4pm': 'no',
			'5pm': 'no',
			'6pm': 'no',
			'7pm': 'no',
			'8pm': 'no',
			'9pm': 'no',
		}
	}

	var data = angular.copy($scope.dataModel);

	if ($scope.name)
		$http.get('https://baddie.firebaseio.com/times/' + $scope.name + '.json').success(function(serverdata){
			if (serverdata === 'null'){
				$scope.update();
			} else {
				$scope.dataModel = serverdata.times;
				data = angular.copy(serverdata.times);
			}
		})

	$scope.update = function(day, time, val){
		if (day && time && val){
			data[day][time] = val;
		}
		
		var send = {
			'times' : data
		}

		$http({url: 'https://baddie.firebaseio.com/times/' + $scope.name + '.json', method: 'PUT', data: send}).success(function(data){
			$rootScope.$broadcast('applied');
		}).error(function(){
			alert('an error has occurred');
		})
	}
})
.controller('times', function($scope, $http){
	function getData(){
		$http.get('https://baddie.firebaseio.com/times.json').success(function(data){
			$scope.data = data;
		});
	}

	getData();
	$scope.$on('applied', function(){
		getData();
	})
})
.controller('pages', function($scope, data){
	$scope.name = data.data.name;
})
.controller('shoppingList', function($scope, data, $firebaseArray){
	$scope.name = data.data.name;
	$scope.language = '';
	var ref = new Firebase("https://baddie.firebaseio.com/list");
	$scope.shoppingList = [];
	$scope.shoppingList = $firebaseArray(ref);
	
	$scope.pickLang = function(){
		if (!$scope.language){
			return 'Language';
		}
		return $scope.language === 'eng' ? 'English' : '中文'; 
	}

	$scope.addNewItem = function(){
		var newItem = $scope.newItem;
		var construct = {
			name: newItem,
			quantity: 1,
			done: false,
			completedBy: '', 
			creator: $scope.name
		}
		for (var i = 0; i < $scope.shoppingList.length; i++){
			if ($scope.shoppingList[i].name == newItem){
				alert('this item exists');
				return;
			}
		}
		$scope.shoppingList.$add(construct);
		$scope.newItem = '';
	}

	$scope.save = function(item){
		$scope.shoppingList.$save(item);
	}
	
})
.service('data', function(){
	this.data = {
		name: ''
	}
})
.filter('language', function(){
	return function(input, key){
		var regex = /[-\w\s()]*/;
		if (key === 'eng'){
			input = input.match(regex)[0];
		} else if (key === 'cn') {
			input = input.replace(input.match(regex)[0], '');
		}
		return input;
	}
})
