
const GOOGLE_LOCATION_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_NEARBY_SEARCH_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/textsearch/json'



function getCityFromAPI(searchItem, callback ){
	const query = {
		address: `${searchItem}`,
		key: 'AIzaSyBpNVqQL4UDljoJpcyU_DuF3nh3avd9ecY'
	}
	$.getJSON(GOOGLE_LOCATION_API_ENDPOINT, query, callback)
}

function initMap(lat, lng){
	let map = new google.maps.Map(document.getElementById('display-map'), {
		center: {
			lat: parseFloat(lat),
			lng: parseFloat(lng)
			// lat: -34.397,
			// lng: 150.644
		},
		zoom: 13
	})
}

function findSurroundingVenues(lat, lng, callback){
	let query = {
		key: 'AIzaSyBfe3xMihX3q9--BLl_0uWnA5jCVPhcFg0',
		query: 'milk tea',
		location: `${parseFloat(lat)},${parseFloat(lng)}`,
		radius: 50
	}
	$.getJSON(GOOGLE_NEARBY_SEARCH_ENDPOINT, query, callback)
};

function createResultObject(item){
	let htmlString = `<h3>${item.name}</h3>
			<p>Rating: ${item.rating}</p>
			<p>Address: ${item.formatted_address}</p>
			<!-- <p>Place_Id: ${item.place_id}</p> -->`

	let resultObject = {
		name: item.name,
		rating: item.rating,
		address: item.formatted_address,
		place_id: item.place_id
		lat: item.geometry.location.lat,
		lng: item.geometry.location.lng
	}
	return resultObject
};

function generateSearchResults(data){
	const results = data.results.map(item =>{
		return createResultObject(item);
	})	
	$('.search-results').html(results);
};

function generateMap(data){

	let city = data.results[0].formatted_address
	let lat = data.results[0].geometry.location.lat;
	let lng = data.results[0].geometry.location.lng;

	initMap(lat, lng)

	findSurroundingVenues(lat, lng, generateSearchResults); 

	// renderSearchResults(htmlString);
};


// function renderSearchResults(html){
// 	const containerDiv = $('.search-results');
// 	containerDiv.html(html)
// };






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
