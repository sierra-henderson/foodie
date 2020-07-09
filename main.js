let city = null;
let map = null;
let service = null;
const markers = [];
let searchTerm = null;
const likesArr = []
let latlang = null;
let currentSelectedRestaurant = [];
const header = document.querySelector('.city-page-hero h1');
const landingPage = document.querySelector('.landing-page');
const cityPage = document.querySelector('.city-page')
const results = document.querySelector('.results')
const searchBar = document.getElementById('searchBar');
const searchButton = document.getElementById('searchButton');
const cityPageHero = document.querySelector('.city-page-hero');
const modalOverlay = document.querySelector('.modal-overlay');
const landingPageHero = document.querySelector('.hero');
const restaurantsButton = document.getElementById('restaurants');
const toursAndTastingsButton = document.getElementById('toursAndTastings');
const cookingClassesButton = document.getElementById('cookingClasses');
const likesBar = document.getElementById('likesBar');
const likesCityHeader = document.getElementById('likesCityHeader')
const categories = document.querySelector('.categories')
const cityPageHeader = document.querySelector('.city-page-hero h1');
const likesPage = document.querySelector('.likes-page');
const mapContainer = document.getElementById('map');
const likesList = document.querySelector('.likesList');
const backToCityButton = document.getElementById('backToCity');

// Queries for modal
const modalImage = document.querySelector('.modal-image')
const businessName = document.getElementById('name')
const starsContainer = document.querySelector('.stars')
const price = document.getElementById('price')
const category = document.getElementById('category')
const address = document.querySelector('.address')
const likeButton = document.getElementById('likeButton')
const closeModalButton = document.getElementById('closeModalButton')

searchButton.addEventListener('click', recordQuery);

restaurantsButton.addEventListener('click', function () {
  yelpQuery(['restaurants']);
})

toursAndTastingsButton.addEventListener('click', function () {
  yelpQuery(['foodtours', 'winetastingroom', 'cheesetastingclasses'])
})

cookingClassesButton.addEventListener('click', function () {
  yelpQuery(['cookingclasses']);
})

closeModalButton.addEventListener('click', closeModal)

likesBar.addEventListener('click', loadLikesPage);

likeButton.addEventListener('click', addToLikes);

backToCityButton.addEventListener('click', goBackToCityPage);

function searchQuery(query) {
  const request = {
    query: query,
    fields: ['name', 'place_id']
  }
  const service = new google.maps.places.PlacesService(header);
  service.findPlaceFromQuery(request, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      searchSuccess(results[0].place_id);
    }
  })
}

function recordQuery() {
  searchTerm = searchBar.value;
  searchQuery(searchTerm);
}

function searchSuccess(data) {
  const request = {
    placeId: data,
    fields: ['formatted_address', 'geometry']
  }
  const service = new google.maps.places.PlacesService(header);
  service.getDetails(request, callback)
  function callback(place, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      city = place.formatted_address;
      $.ajax({
        method: 'GET',
        url: `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?location=${city}`,
        headers: {
          Authorization: 'Bearer ' + yelpKey
        },
        success: function() {
          landingPage.classList.add('hidden');
          cityPage.classList.remove('hidden');
          header.textContent = place.formatted_address;
          latlang = place.geometry;
          createImage(place.formatted_address);
          yelpQuery(['restaurants'])
        },
        error: function (err) {
          const div = document.createElement('div');
          div.className = 'error-modal'
          div.textContent = 'Sorry! This city is not supported by food.ie at this time.'
          landingPageHero.append(div);
        }
      })

    }
  }
}

function createImage(place) {
  $.ajax({
    method: "GET",
    headers: {
      Authorization: "Client-ID " + unsplashKey,
      'Accept-Version': 'v1'
    },
    url: `https://api.unsplash.com/search/photos?query=${searchTerm}&orientation=landscape&client_id=wJINoYlAErEt2iN9vdlMlVRA0hQS4N4hSz0mYyt0SRA`,
    success: photoSuccess,
    fail: photoFail
  })
}

function photoSuccess(photo) {
  cityPageHero.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${photo.results[0].urls.full})`
}

function photoFail(err) {
  console.log(err);
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

function yelpQuery(arr) {
  for (let i = 0; i < categories.children.length; i++) {
    categories.children[i].classList.remove('active')
  }
  if (arr.indexOf('restaurants') > -1) {
    restaurantsButton.classList.add('active');
  } else if (arr.indexOf('foodtours') > -1) {
    toursAndTastingsButton.classList.add('active');
  } else if (arr.indexOf('cookingclasses') > -1) {
    cookingClassesButton.classList.add('active');
  }
  const resultsChildren = results.children;
  while (resultsChildren.length > 0) {
    results.removeChild(resultsChildren[0]);
  }
  arr.forEach(category => {
    let url = category === 'restaurants'
      ? `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=off the beaten path&categories=${category}&location=${city}`
      : `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?categories=${category}&location=${city}&limit=50`
      $.ajax({
        method: 'GET',
        url,
        headers: {
          Authorization: 'Bearer ' + yelpKey
        },
        success: function (result) {
          if (result.businesses.length > 0) {
            makeCards(category, result.businesses);
          }
        },
        error: function (err) {
          console.log("ErRoR:", err)
        }
      })
  })
}

function makeCards(type, data) {
  const h2 = document.createElement('h2');
  let title = type;
  const titles = {
    foodtours: 'Food Tours',
    winetastingroom: 'Wine Tasting',
    cheesetastingclasses: 'Cheese Tasting',
    cookingclasses: 'Cooking Classes',
    restaurants: 'Restaurants'
  }
  if(titles[type]) {
    title = titles[type]
  }
  h2.textContent = title;
  const resultsHeader = document.createElement('div');
  resultsHeader.className = 'results-header'
  results.append(resultsHeader)
  resultsHeader.append(h2)
  // if (title === 'Restaurants') {
  //   const filterButton = document.createElement('button');
  //   filterButton.textContent = 'Filter'
  //   resultsHeader.append(filterButton);
  //   filterButton.addEventListener('click', filterModal);
  // }
  results.append(resultsHeader)
  data.forEach(el => {
    const cardImageDiv = document.createElement('div')
    cardImageDiv.className = 'card-image';
    cardImageDiv.style.backgroundImage = `url(${el.image_url})`
    const cardTextDiv = document.createElement('div')
    cardTextDiv.className = 'card-text'
    const h3 = document.createElement('h3')
    h3.textContent = el.name;
    const button = document.createElement('button')
    button.addEventListener('click', function() {
      popModal(el, title)
    })
    button.textContent = 'More Info'
    cardTextDiv.append(h3, button);
    const cardDiv = document.createElement('div')
    cardDiv.className = 'card'
    cardDiv.append(cardImageDiv, cardTextDiv);
    results.append(cardDiv);
  })
}

function popModal(data, title) {
  modalOverlay.classList.remove('hidden');
  modalImage.style.backgroundImage = `url("${data.image_url}")`;
  businessName.textContent = data.name;
  const fullStars = Math.floor(data.rating);
  if (starsContainer.children.length > 0) {
    while (starsContainer.children.length > 0) {
      starsContainer.removeChild(starsContainer.children[0]);
    }
  }
  for (let i = 0; i < fullStars; i++) {
    const star = document.createElement('i');
    star.className = 'fas fa-star'
    starsContainer.append(star);
  }
  if (data.rating - fullStars === 0.5) {
    const halfStar = document.createElement('i');
    halfStar.className = 'fas fa-star-half'
    starsContainer.append(halfStar);
  }
  price.textContent = data.price;
  let categories = "";
  data.categories.forEach(el => {
    categories += " " + el.title + ","
  })
  const newCategories = categories.replace(/,$/, "");
  category.textContent = newCategories
  if (address.children.length > 0) {
    while (address.children.length > 0) {
      address.removeChild(address.children[0]);
    }
  }
  data.location.display_address.forEach(line => {
    const p = document.createElement('p')
    p.textContent = line;
    address.append(p)
  })
  currentSelectedRestaurant = [data, title]
}

function addToLikes() {
  const [data, title] = currentSelectedRestaurant
  const fullAddress = data.location.display_address.join(" ");
  const likeObj = {
    address: fullAddress,
    name: data.name,
    rating: data.rating,
    price: data.price,
    categories: data.categories,
    mainCategory: title,
    image: data.image_url,
    coordinates: data.coordinates,
    city: cityPageHeader.textContent,
    north: (latlang.viewport.Ya.i + latlang.viewport.Ya.j) / 2,
    east: (latlang.viewport.Ua.i + latlang.viewport.Ua.j) / 2,
    id: data.id
  }
  if (!likesArr.some(el => data.id === el.id)) {
    likesArr.push(likeObj);
  }
}

function loadLikesPage() {
  likesCityHeader.textContent = likesArr[0].city;
  cityPage.classList.add('hidden');
  likesPage.classList.remove('hidden');
  if (likesList.children.length > 1) {
    while (likesList.children.length > 1) {
      likesList.removeChild(likesList.children[1]);
    }
  }
  likesArr.forEach(el => {
    const likesPhoto = document.createElement('div');
    likesPhoto.className = 'likes-photo';
    likesPhoto.style.backgroundImage = `url(${el.image})`;
    const firstRow = document.createElement('div');
    firstRow.className = 'row';
    const placeName = document.createElement('h3')
    placeName.textContent = el.name;
    const starDiv = document.createElement('div');
    starDiv.className = 'stars';
    const fullStars = Math.floor(el.rating);
    for (let i = 0; i < fullStars; i++) {
      const star = document.createElement('i');
      star.className = 'fas fa-star'
      starDiv.append(star);
    }
    if (el.rating - fullStars === 0.5) {
      const halfStar = document.createElement('i');
      halfStar.className = 'fas fa-star-half'
      starDiv.append(halfStar);
    }
    firstRow.append(placeName, starDiv)
    const secondRow = document.createElement('div');
    secondRow.className = 'row'
    const price = document.createElement('p');
    price.setAttribute("id", "likePrice");
    price.textContent = el.price;
    const categories = document.createElement('p');
    categories.setAttribute("id", "likeCategory");
    let categoryStr = "";
    el.categories.forEach(cat => {
      categoryStr += " " + cat.title + ","
    })
    const newCategoryStr = categoryStr.replace(/,$/, "");
    categories.textContent = newCategoryStr;
    secondRow.append(price, categories);
    const deleteButtonContainer = document.createElement('div');
    const deleteItemButton = document.createElement('i');
    deleteItemButton.className = 'fas fa-trash fa-lg';
    deleteItemButton.addEventListener('click', function() {
      deleteItem(el.id, el.name);
    });
    deleteButtonContainer.append(deleteItemButton)
    const likesText = document.createElement('div');
    likesText.className = 'likes-text';
    likesText.append(firstRow, secondRow, deleteButtonContainer)
    const likeContainer = document.createElement('div');
    likeContainer.className = 'like-container';
    likeContainer.append(likesPhoto, likesText);
    likesList.append(likeContainer);

  })
  console.log(likesArr);
  initMap(likesArr)
}

function initMap(arr) {
  const place = new google.maps.LatLng(arr[0].north, arr[0].east);

  map = new google.maps.Map(
    mapContainer, { center: place, zoom: 12 });

  arr.forEach(el => {
    const request = {
      query: el.address,
      fields: ['name', 'geometry'],
    };
    const infowindow = new google.maps.InfoWindow({
      content: el.name
    });
    const service = new google.maps.places.PlacesService(map);

    service.findPlaceFromQuery(request, function (results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
          createMarker(results[0], infowindow);
        map.setCenter(results[0].geometry.location);
      }
    });
  })
}

function createMarker(place, infowindow) {
  const marker = new google.maps.Marker({
    position: place.geometry.location,
    map: map
  });
  markers.push(marker);
  marker.addListener('click', function () {
    infowindow.open(map, marker);
  });
}

function goBackToCityPage() {
  likesPage.classList.add('hidden');
  cityPage.classList.remove('hidden');
}

function deleteItem(id, name) {
  likesArr.forEach((el, i) => {
    if (el.id === id) {
      likesArr.splice(i, 1);
      markers[i].setMap(null);
    }
  })
  const likeContainer = document.querySelectorAll('.like-container')
    likeContainer.forEach((item, index) => {
      if (item.querySelector('h3').textContent === name) {
        item.parentElement.removeChild(likeContainer[index]);
      }
    })

  }
