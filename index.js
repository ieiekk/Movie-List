const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12  //每頁只顯示12筆資料

const movies = []
let filteredMovies = []
let pageCurrent = 1
let displayMode = 'CARD'

const dataPanel = document.querySelector('#data-panel')
const movieModal = document.querySelector('#movieModal')
const searchButton = document.querySelector('#search-submit')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const displayModeWrapper = document.querySelector('#display-mode')

axios
  .get(INDEX_URL)
  .then(response => {
    const results = response.data.results
    // results.forEach(result => {
    //   console.log(result)
    //   movies.push(result)
    // })
    
    
    // 展開運算子"..."
    movies.push(...results)
    
    renderMovieList(getMoviesByPage(pageCurrent), displayMode)
    renderPaginator(movies.length)
  })
  
  
dataPanel.addEventListener('click', onDataPanelClicked)
movieModal.addEventListener('hidden.bs.modal', onModalHidden)
searchButton.addEventListener('click', onSearchButtonClicked)
paginator.addEventListener('click', onPaginatorClicked)
displayModeWrapper.addEventListener('click', onDisplayModeClicked)
  
  
  
// functions ==============================================================================

function getMoviesByPage (page) {
  // page:1 -> movies: 0-11
  // page:2 -> movies: 12-23
  // page:3 -> movies: 24-35
  
  // movies有兩種: 1.all movies 2.filtered movies

  const data = filteredMovies.length ? filteredMovies : movies

  const startIndex = (page -1) * MOVIES_PER_PAGE
  const endIndex = page * MOVIES_PER_PAGE

  return data.slice(startIndex, endIndex)
}

function renderPaginator (amount) {
  // 80 / 12 = 6 ... 8 -> 7 pages
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  
  let htmlContent = ''
  
  for (let page = 1; page <= numberOfPages; page++) {
    htmlContent += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  
  paginator.innerHTML = htmlContent
}

function onSearchButtonClicked (event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    alert(`沒有符合${keyword}的結果`)
    return
  }

  // 每次搜尋都要顯示第一頁的結果
  pageCurrent = 1

  renderMovieList(getMoviesByPage(pageCurrent), displayMode)
  renderPaginator(filteredMovies.length)
}
  
function renderMovieList (data, mode='CARD') {
  
  let htmlContent = ''

  // processing
  if (mode === 'CARD') {
    data.forEach(result => {
      htmlContent += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img src=${POSTER_URL + result.image}
            class="card-img-top" alt="Movie Poster" />
              <div class="card-body">
                <h5 class="card-title">${result.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"  data-bs-target="#movieModal" data-id=${result.id}>More</button>
                <button class="btn btn-info btn-add-favorite" data-id=${result.id}>+</button>
              </div>
            </div>
          </div>
        </div>
      `
    })
  } else if (mode === 'LIST') {
    htmlContent += `
      <ul class="list-group list-group-flush">
    `
    data.forEach(result => {
      htmlContent += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          ${result.title}
          <div>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"  data-bs-target="#movieModal" data-id=${result.id}>More</button></span>
            <button class="btn btn-info btn-add-favorite" data-id=${result.id}>+</button>
          </div>
        </li>
      `
    })
    htmlContent += `
      </ul>
    `
  }

  dataPanel.innerHTML = htmlContent
}

function showMovieModal (id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id)
    .then(response => {
      const result = response.data.results
      modalTitle.innerTex = result.title
      // 若用以下這種寫法，會有在loading完成前圖片還是上一張的問題
      // modalImage.src = POSTER_URL + result.image
      // 因此改用直接修改HTML的方式，避免圖片暫時性錯誤
      modalImage.innerHTML = `
        <img src=${POSTER_URL + result.image} alt="Movie Poster" class="image-fluid">
      `
      modalDate.innerText = 'Release Date: ' + result.release_date
      modalDescription.innerText = result.description
    })
}

function onDataPanelClicked (event) {
  const target = event.target
  const id = target.dataset.id
  if (target.classList.contains('btn-show-movie')) {
    showMovieModal(Number(id))
  } else if (target.classList.contains('btn-add-favorite')) {
    addFavoriteMovie(Number(id))
  }
}

function onModalHidden (event) {
  const modalImage = document.querySelector('#movie-modal-image')
  modalImage.innerHTML = ''
}

function addFavoriteMovie (id) {
  const movie = movies.find(movie => movie.id === id)
  const favoriteList = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  if (favoriteList.some(movie => movie.id === id)) {
    return alert('此電影已在清單內')
  }

  favoriteList.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteList))
}

function onPaginatorClicked (event) {
  const target = event.target
  if (target.tagName !== 'A') {
    return
  }
  const page = Number(target.dataset.page)
  if (page === pageCurrent) {
    event.preventDefault()
    return
  }
  pageCurrent = page
  renderMovieList(getMoviesByPage(pageCurrent), displayMode)
}

function onDisplayModeClicked (event) {
  const target = event.target
  if (target.tagName !== 'I') {
    return
  }

  if (target.classList.contains('fa-bars') && displayMode !== 'LIST') {
    displayMode = 'LIST'
    target.nextElementSibling.classList.toggle('color-icon')
  } else if (target.classList.contains('fa-th') && displayMode !== 'CARD') {
    displayMode = 'CARD'
    target.previousElementSibling.classList.toggle('color-icon')
  } else {
    return
  }
  target.classList.toggle('color-icon')
  renderMovieList(getMoviesByPage(pageCurrent), displayMode)
  console.log(`Current Display Mode : ${displayMode}`)
}