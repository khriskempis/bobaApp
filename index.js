
const GOOGLE_LOCATION_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_NEARBY_SEARCH_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/textsearch/json'





function createInfoWindow(item){
let contentHtml = `<div id="infowindow-content">
      <img id="place-icon" src="${item.icon}" height="16" width="16">
      <span id="place-name"  class="title">${item.name}</span><br>
      ${item.openNow ? 'Open' : 'Closed'}<br>
      <span id="place-address">${item.address}</span>
    </div>`

	let infoWindow = new google.maps.InfoWindow({
		content: contentHtml
	});
	return infoWindow
};

function populateMapWithMarkers(map){

	const markers = SESSION_ARRAY.map((item, i) => {
		window.setTimeout(() => {
			let marker = new google.maps.Marker({
				position: new google.maps.LatLng(item.lat, item.lng),
				map: map,
				title: item.name,
				animation: google.maps.Animation.DROP
			});

			let infoWindow = createInfoWindow(item);

			marker.addListener('mouseover', function(){
				infoWindow.open(map, marker)
			})
			marker.addListener('mouseout', function(){
				infoWindow.close(); 
			})
			marker.addListener('click', function(){
				infoWindow.open(map, marker)
		});

		return marker 

		}, i * 100);

	});

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

function createSimpleAddress(formatted_address){
	let simpleAddress = formatted_address.split(',')
	return simpleAddress[0]
}

function createResultObject(item){

	let resultObject = {
		name: item.name,
		rating: item.rating,
		address: createSimpleAddress(item.formatted_address),
		place_id: item.place_id,
		icon: item.icon,
		openNow: item.opening_hours.open_now,
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
		SESSION_ARRAY = []
		const results = data.results.map(item =>{
		return createResultObject(item);
	})	
		for(i = 0; i < 10; i++){
			SESSION_ARRAY.push(results[i])
		}
	let resultsHtml = generateResultsHtml(SESSION_ARRAY)
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
