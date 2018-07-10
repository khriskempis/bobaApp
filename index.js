
const GOOGLE_LOCATION_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_NEARBY_SEARCH_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/textsearch/json'


function populateMapWithMarkers(map){

	const markers = SESSION_ARRAY.map((item, i) => {
		window.setTimeout(() => {
			let marker = new google.maps.Marker({
				position: new google.maps.LatLng(item.lat, item.lng),
				map: map,
				title: item.name,
				animation: google.maps.Animation.DROP
			});
		return marker
		}, i * 100);
	});

	// for(let i = 0; i < markers.length; i++){
	// 	markers[i].setMap(map)
	// }
};

function initMap(lat, lng){
	let map = new google.maps.Map(document.getElementById('display-map'), {
		center: {
			lat: parseFloat(lat),
			lng: parseFloat(lng)
		},
		zoom: 12
	})
	return map
}

function findSurroundingVenues(lat, lng, callback){
	let query = {
		key: 'AIzaSyBfe3xMihX3q9--BLl_0uWnA5jCVPhcFg0',
		query: 'milk tea',
		location: `${lat},${lng}`,
		radius: 10
	}
	$.getJSON(GOOGLE_NEARBY_SEARCH_ENDPOINT, query, callback)
};

function createResultObject(item){

	let resultObject = {
		name: item.name,
		rating: item.rating,
		address: item.formatted_address,
		place_id: item.place_id,
		lat: item.geometry.location.lat,
		lng: item.geometry.location.lng
	}
	return resultObject
};

function generateResultsHtml(array){
	let resultsHtml = array.map(item => {
		return htmlString = `<h3>${item.name}</h3>
			<p>Rating: ${item.rating}</p>
			<p>Address: ${item.address}</p>
			<!-- <p>Place_Id: ${item.place_id}</p> -->`
	});
	return resultsHtml;
}

function generateSearchResults(data){
		const results = data.results.map(item =>{
		return createResultObject(item);
	})	
		for(i = 0; i < results.length; i++){
			SESSION_ARRAY.unshift(results[i])
		}
	let resultsHtml = generateResultsHtml(results)
	$('.search-results').html(resultsHtml);
};


function generateMap(data){

	let city = data.results[0].formatted_address
	let lat = parseFloat(data.results[0].geometry.location.lat);
	let lng = parseFloat(data.results[0].geometry.location.lng);

	findSurroundingVenues(lat, lng, generateSearchResults); 
	
	let map = initMap(lat, lng);

	setTimeout(()=>{
		populateMapWithMarkers(map)
	}, 800);
};


function getCityFromAPI(searchItem, callback ){
	const query = {
		address: `${searchItem}`,
		key: 'AIzaSyBpNVqQL4UDljoJpcyU_DuF3nh3avd9ecY'
	}
	$.getJSON(GOOGLE_LOCATION_API_ENDPOINT, query, callback)
}

// CLICK EVENTS 

function handleSubmit(){
	const searchForm = $('.js-search-form')


	searchForm.submit(function(event){
		event.preventDefault();

		const queryTarget = searchForm.find('#location-search')
		const citySearch = queryTarget.val(); 
		const submitButton = $('.submit-button')

		getCityFromAPI(citySearch, generateMap); 

		queryTarget.val(''); 
	});
}


$(handleSubmit())
