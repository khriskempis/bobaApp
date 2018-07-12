
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
				let name = marker.title
				let venueObject= SESSION_ARRAY.find(object => object.name === name)
				getVenueDetails(venueObject.place_id); 
		});

		return marker 

		}, i * 100);
	});
};

function renderResultFocus(data){
	let venueFocus = $('.js-venue-focus')
	let htmlString = `<h2>${data.result.name}</h2>
				<p>
					<span>${data.result.formatted_address}</span><br>
					<span>${data.result.formatted_phone_number}</span>
					<p>${data.result.reviews[0].text}</p>
				</p>
				<p>description</p>
	`
	$(venueFocus).html(htmlString)
};

function getVenueDetails(place_id){
	const GOOGLE_PLACE_DETAILS_ENDPOINT = 'https://maps.googleapis.com/maps/api/place/details/json'
	let query = {
		key: 'AIzaSyBfe3xMihX3q9--BLl_0uWnA5jCVPhcFg0',
		place_id: `${place_id}`,
		fields: 'name,formatted_address,icon,url,photo,website,formatted_phone_number,review'
	}
	$.getJSON(GOOGLE_PLACE_DETAILS_ENDPOINT, query, renderResultFocus)

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

// function renderImageSrc(data){
// 	let imgElement = $('.js-img-focus')
// 	console.log('made it')
// }

// function getphoto(photo_reference){
// 	const GOOGLE_PHOTO_REFERENCE = 'https://maps.googleapis.com/maps/api/place/photo'
// 	let query = {
// 		key: 'AIzaSyBfe3xMihX3q9--BLl_0uWnA5jCVPhcFg0',
// 		photo_reference: `${photo_reference}`,
// 		maxwidth: 400
// 	}

// 	$.getJSON(GOOGLE_PHOTO_REFERENCE, query, renderImageSrc)

	
// };

function createSimpleAddress(formatted_address){
	let simpleAddress = formatted_address.split(',')
	return simpleAddress[0]
};

function createResultObject(item){

	let resultObject = {
		name: item.name,
		rating: item.rating,
		address: createSimpleAddress(item.formatted_address),
		place_id: item.place_id,
		icon: item.icon,
		openNow: item.opening_hours.open_now,
		// photo: getphoto(item.photos[0].photo_reference),
		lat: item.geometry.location.lat,
		lng: item.geometry.location.lng
	}
	return resultObject
};

function generateResultsHtml(array){
	let resultsHtml = array.map(item => {
		return htmlString = `<div class="venue-card col-3">
					<h3><img id="place-icon" src="${item.icon}" height="16" width="16"> ${item.name}</h3>
					<p>Rating: ${item.rating}</p>
					<p>${item.address}</p>
					<p>${item.openNow ? 'Open' : 'Closed'}</p>
				</div>`
	});
	return resultsHtml;
}

function generateSearchResults(data){
		SESSION_ARRAY = []
		const results = data.results.map(item =>{
		return createResultObject(item);
	})	
		for(i = 0; i < 12; i++){
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

		$('.js-search-header').html(`Search Results for ${citySearch}`)

		queryTarget.val(''); 
	});
}


$(handleSubmit())
