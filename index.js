
const GOOGLE_API_ENDPOINT = 'https://maps.googleapis.com/maps/api/geocode/json'



function getDataFromAPI(searchItem, callback ){
	const query = {
		address: `${searchItem}`,
		key: 'AIzaSyBpNVqQL4UDljoJpcyU_DuF3nh3avd9ecY'
	}
	$.getJSON(GOOGLE_API_ENDPOINT, query, callback)
}



function generateMap(data){

	let city = data.results[0].formatted_address
	let lat = data.results[0].geometry.location.lat;
	let long = data.results[0].geometry.location.lng;

	const htmlString = `<hr>
			<div role="contentinfo" class="search-item">
				<h3>${city}</h2>
				<p>${lat}</p>
				<p>${long}</p>
			</div>
			<hr>`

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

		getDataFromAPI(citySearch, generateMap); 

		queryTarget.val(''); 
	});
}

$(handleSubmit())