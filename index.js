
const GOOGLE_LOCATION_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json'
const GOOGLE_NEARBY_SEARCH_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/textsearch/json'



function createInfoWindow(item){
let contentHtml = `<div id="infowindow-content">
      <img id="place-icon" src="${item.icon}" height="16" width="16">
      <span id="place-name"  class="title">${item.name}</span><br>
      ${item.openNow ? 'Open Now' : 'Closed'}<br>
      <span id="place-address">${item.address}</span>
    </div>`

	let infoWindow = new google.maps.InfoWindow({
		content: contentHtml
	});
	return infoWindow
};

function populateMapWithMarkers(map){

	const markers = SESSION_ARRAY.map((item, i) => {
		// populates map with timeout so drop animation triggers one by one
		window.setTimeout(() => {
			let marker = new google.maps.Marker({
				position: new google.maps.LatLng(item.lat, item.lng),
				map: map,
				title: item.name,
				animation: google.maps.Animation.DROP
			});

			let infoWindow = createInfoWindow(item);
			// add listners to the following events 
			marker.addListener('mouseover', function(){
				infoWindow.open(map, marker)
			})
			marker.addListener('mouseout', function(){
				infoWindow.close(); 
			})
			marker.addListener('click', function(){
				infoWindow.open(map, marker)
				// after click, infoWindow closes after 3 sec
				window.setTimeout(()=>{infoWindow.close()}, 3000)
				let name = marker.title
				// finds marker being clicked, finds name, grabs place_id and gets venue description to display
				let venueObject= SESSION_ARRAY.find(object => object.name === name)
				getVenueDetails(venueObject.place_id); 
		});

		return marker 

		}, i * 200);
	});
};

// removes State and Country from address 
function createAddress(formatted_address){
	let addressArray = formatted_address.split(',')
	let newAddress = `<span>${addressArray[0]} ${addressArray[1]}</span>`
			
	return newAddress
}

function generateShortReview(text){
	let textArray = text.split(' ')
	let shortReview = '';

// loop until through text Array and only add the string if it doesn't equal undefined
	for (i = 0; i < 25; i++){
		if(textArray[i] !== undefined){
			shortReview+= textArray[i] + ' '
		} 
	}
// if the review string is longer that 60, add "..." 
	if(shortReview.length > 60){
		shortReview+= '...'
	}
	return shortReview
}

function renderResultFocus(data){
	let venueFocus = $('.js-venue-focus')
	let htmlString = `<h2><a href="${data.result.website}" target="_blank">${data.result.name}</a></h2>
				<p class="venue-content">
					<span class="address">${createAddress(data.result.formatted_address)}</span><br>
					<span class="rating">Rating: ${data.result.rating}</span>
					<span class="phone-number">${data.result.formatted_phone_number}</span><br>
					<span class="food-service">${(data.result.types).find(item => item === "restaurant") ? '<span class="food">Serves Food</span>' : '<span class="no-food">Doesn\'t Serve Food</span>'}</span><br>
					<h5>Reviews</h5>
					<p class="review-description">${generateShortReview(data.result.reviews[0].text)}</p>
					<p class="review-description">${generateShortReview(data.result.reviews[1].text)}</p>	
				</p>
	`
	$(venueFocus).html(htmlString)
};

function getVenueDetails(place_id){
	const GOOGLE_PLACE_DETAILS_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/details/json'
	let query = {
		key: 'AIzaSyBfe3xMihX3q9--BLl_0uWnA5jCVPhcFg0',
		place_id: `${place_id}`,
		fields: 'name,formatted_address,type,icon,url,photo,website,formatted_phone_number,rating,review'
	}
	$.getJSON(GOOGLE_PLACE_DETAILS_ENDPOINT, query, renderResultFocus).fail(displayError)

};

// init's map with a default focus on LA 
function initMap(){
	let map = new google.maps.Map(document.getElementById('display-map'), {
		center: {
			lat: 34.0522342,
			lng: -118.2436849
			},
		zoom: 12
	})

	return map
}

// focus map on user input 
function initMapAfterCall(lat, lng){
	let map = new google.maps.Map(document.getElementById('display-map'), {
		center: {
			lat: parseFloat(lat),
			lng: parseFloat(lng)
		},
		zoom: 12
	});

	return map
}

function displayError(err){
	let venueFocus = $('.js-venue-focus')

	let htmlString = '<span>Please Try Again..</span><br><span>Make sure CORS is enabled</span>'

	venueFocus.html(htmlString)
}

function findSurroundingVenues(lat, lng, callback){
	let query = {
		key: 'AIzaSyBfe3xMihX3q9--BLl_0uWnA5jCVPhcFg0',
		query: 'milk tea',
		location: `${lat},${lng}`,
		radius: 10
	}
	$.getJSON(GOOGLE_NEARBY_SEARCH_ENDPOINT, query, callback)
		.fail(displayError)
};

// only displays street number
function createSimpleAddress(formatted_address){
	let simpleAddress = formatted_address.split(',')
	return simpleAddress[0]
};

// object which is stored in SESSION_ARRAY which contains all necessary info
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
		return htmlString = `<div class="venue-card col-3">
					<h3 class="title"><img id="place-icon" src="${item.icon}" height="16" width="16" alt="tea icon"> ${item.name}</h3>
					<p class="rating">Rating: ${item.rating}</p>
					<p class='address'>${item.address}</p>
					<p>${item.openNow ? 'Open Now' : 'Closed'}</p>
				</div>`
	});
	return resultsHtml;
}

function generateSearchResults(data){
	// empties array
		SESSION_ARRAY = []
	// populates results array with objects 
		const results = data.results.map( (item, i) =>{
			if( item.name === 'Prinkipia Tea House'){
			return ' '
			}
		return createResultObject(item);
	})	
	// populates SESSION_ARRAY to be used for each search
		for(i = 0; i < 8; i++){
			SESSION_ARRAY.push(results[i])
		}
	// displays search results on DOM based on objects in SESSION_ARRAY
	let resultsHtml = generateResultsHtml(SESSION_ARRAY)
	$('.search-results').html(resultsHtml);
};


function generateMap(data){

	let city = data.results[0].formatted_address
	let lat = parseFloat(data.results[0].geometry.location.lat);
	let lng = parseFloat(data.results[0].geometry.location.lng);
	
	findSurroundingVenues(lat, lng, generateSearchResults); 

// initializes map after the geolocation coordinates are found
	let map = initMapAfterCall(lat, lng);
// if SESSION ARRAY is not populated, display boba around default city Los Angeles
		if (SESSION_ARRAY.length === 0){
			displayError();
			getCityFromAPI('Los Angeles', generateMap)
		}
	 else {
// otherwise wait till its populated then display markers on map
			setTimeout(()=>{
				populateMapWithMarkers(map)
		}, 800);
	}
};

// grabs lat long coordinates to send to API
function getCityFromAPI(searchItem, callback ){
	const query = {
		address: `${searchItem}`,
		key: 'AIzaSyBpNVqQL4UDljoJpcyU_DuF3nh3avd9ecY'
	}
	$.getJSON(GOOGLE_LOCATION_API_ENDPOINT, query, callback).fail(displayError)
}

// CLICK EVENTS 

function handleVenueCardClicked(){
	let venueCard = $('.js-search-results')

	$(venueCard).on('click', '.venue-card', function(event){
		event.stopPropagation();
		console.log($(this).siblings())
	})
}

function handleSubmit(){
	const searchForm = $('.js-search-form')

	searchForm.submit(function(event){
		event.preventDefault();

		const queryTarget = searchForm.find('#location-search')
		const citySearch = queryTarget.val(); 
		const submitButton = $('.submit-button')

		getCityFromAPI(citySearch, generateMap); 

		let searchResultsDisplay = $('.js-search-header')

		searchResultsDisplay.html(`8 Search Results for ${citySearch}`)
		// waits 1 sec then grabs first object in array to be displayed
		setTimeout(() => {getVenueDetails(SESSION_ARRAY[1].place_id)}, 1000);

		queryTarget.val(''); 
	});
}

function init(){
	$(handleVenueCardClicked())
	$(handleSubmit())
}


$(init())
