
const GOOGLE_LOCATION_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json'



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

function findSurroundingVenues(lat, lng){
	let query ={
		
	}
};

function generateMap(data){

	let city = data.results[0].formatted_address
	let lat = data.results[0].geometry.location.lat;
	let lng = data.results[0].geometry.location.lng;

	const htmlString = `<hr>
			<div role="contentinfo" class="search-item">
				<h3>${city}</h2>
				<p>${lat}</p>
				<p>${lng}</p>
			</div>
			<hr>`

	initMap(lat, lng)

	findSurroundingVenues(lat, lng)


	renderSearchResults(htmlString);
};


function renderSearchResults(html){
	const containerDiv = $('.search-results');
	containerDiv.html(html)
};






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
