
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

function createAddress(formatted_address){
	let addressArray = formatted_address.split(',')
	let newAddress = `<span>${addressArray[0]} ${addressArray[1]}</span>`
			
	return newAddress
}

function generateShortReview(text){
	let textArray = text.split(' ')
	let shortReview = '';

	for(i=0; i < 25; i++){
		shortReview+= textArray[i] + ' '
		if (!textArray[i]){
			break
		} else if (shortReview[i] === undefined || shortReview.length > 20){
			shortReview[i] = '...'
		}
	}
	shortReview +='...'
	return shortReview
}

function renderResultFocus(data){
	let venueFocus = $('.js-venue-focus')
	let htmlString = `<h2><a href="${data.result.website}" target="_blank">${data.result.name}</a></h2>
				<p class="venue-content">
					<span class="address">${createAddress(data.result.formatted_address)}</span><br>
					<span class="rating">${data.result.rating}</span>
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
	$.getJSON(GOOGLE_PLACE_DETAILS_ENDPOINT, query, renderResultFocus).fail(()=> console.log('Try Again'))

};

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

function findSurroundingVenues(lat, lng, callback){
	let query = {
		key: 'AIzaSyBfe3xMihX3q9--BLl_0uWnA5jCVPhcFg0',
		query: 'milk tea',
		location: `${lat},${lng}`,
		radius: 10
	}
	$.getJSON(GOOGLE_NEARBY_SEARCH_ENDPOINT, query, callback)
		.fail(function(error){
			console.log(error)
		})
};

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
		lat: item.geometry.location.lat,
		lng: item.geometry.location.lng
	}
	return resultObject
};

function generateResultsHtml(array){
	let resultsHtml = array.map(item => {
		return htmlString = `<div class="venue-card col-3">
					<h3 class="title"><img id="place-icon" src="${item.icon}" height="16" width="16"> ${item.name}</h3>
					<p class="rating">Rating: ${item.rating}</p>
					<p class='address'>${item.address}</p>
					<p>${item.openNow ? 'Open Now' : 'Closed'}</p>
				</div>`
	});
	return resultsHtml;
}

function generateSearchResults(data){
		SESSION_ARRAY = []
		const results = data.results.map( (item, i) =>{
			if( item.name === 'Prinkipia Tea House'){
			return ' '
			}
		return createResultObject(item);
	})	
		for(i = 0; i < 8; i++){
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
	
	let map = initMapAfterCall(lat, lng);

	if (!SESSION_ARRAY){
		getCityFromAPI('Los Angeles', generateMap)
	} else {
			setTimeout(()=>{
				populateMapWithMarkers(map)
		}, 800);
	}
};


function getCityFromAPI(searchItem, callback ){
	const query = {
		address: `${searchItem}`,
		key: 'AIzaSyBpNVqQL4UDljoJpcyU_DuF3nh3avd9ecY'
	}
	$.getJSON(GOOGLE_LOCATION_API_ENDPOINT, query, callback)
}

// CLICK EVENTS 

function handleVenueCardClicked(){
	let venueCard = $('.js-search-results')

	$(venueCard).on('click', '.venue-card', function(event){
		event.stopPropagation()
		console.log($(this).closest('.title').html())
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

		searchResultsDisplay.html(`Search Results for ${citySearch}`)

		// searchForm.removeClass('center-map')
		// 	.addClass('above-map')

		setTimeout(() => {getVenueDetails(SESSION_ARRAY[1].place_id)}, 1000);

		queryTarget.val(''); 
	});
}

function init(){
	$(handleVenueCardClicked())
	$(handleSubmit())
}


$(init())
