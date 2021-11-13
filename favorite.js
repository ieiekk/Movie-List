const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector('#data-panel')
const movieModal = document.querySelector('#movieModal')
const searchButton = document.querySelector('#search-submit')
const searchInput = document.querySelector('#search-input')


renderMovieList(movies)
  
  
dataPanel.addEventListener('click', onDataPanelClicked)
movieModal.addEventListener('hidden.bs.modal', onModalHidden)
addEventListener('storage', onStorageChanged)
  
  
  
// functions ==============================================================================
  
function renderMovieList (data) {
   let htmlContent = ''

   // processing
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
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"   data-bs-target="#movieModal" data-id=${result.id}>More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id=${result.id}>x</button>
             </div>
           </div>
         </div>
       </div>
     `
  })

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
  } else if (target.classList.contains('btn-remove-favorite')) {
    removeFavoriteMovie(Number(id))
    // location.reload() => 刷新頁面會有畫面閃一下的問題
    // Better way:直接重新渲染元素
    renderMovieList(movies)
  }
}

function onModalHidden (event) {
  const modalImage = document.querySelector('#movie-modal-image')
  modalImage.innerHTML = ''
}

function removeFavoriteMovie (id) {
  const removedMovieIndex = movies.findIndex(movie => movie.id === id)
  movies.splice(removedMovieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
} 

function onStorageChanged (event) {
  location.reload()
}