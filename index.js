// 載入API網址
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIE_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')

function renderMovieList(data) {
  let rawHTML = ''

  // processing 因為電影清單是一個陣列所以用forEach拿出來
  data.forEach((item) => {
    //我們需要 title image
    rawHTML += `<div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body" style="height:124px">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  });

  dataPanel.innerHTML = rawHTML
}
//製作有幾個分頁面
function renderPaginator(amount) {
  // 80 / 12 = 6....8  共7頁  使用ceil 是無條件進入
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li >
    `
  }
  paginator.innerHTML = rawHTML
}

// 分頁函式 page -> 
function getMoviesByPage(page) {

  //有一般電影清單 跟 收藏的清單  所以這邊要注意
  const data = filteredMovies.length ? filteredMovies : movies
  //page 1 -> movies 0 ~ 11  , page 2 -> movies 12 ~ 23 ...
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}


// 點擊後出現的內容
function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then(response => {
    // response.data.results
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release data: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    // innerHTML 要改的是image
  })
}
//儲存收藏清單
function addToFavorite(id) {
  // find裡可以放 function isMovieIdMatched(movie) {
  //   return movie.id ===  }
  //如果有找到的話就給我  沒有的話就給我空陣列 , JSON可以把會把字串變成jc的物件或陣列
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  //如果有重複的電影就刪掉 點擊過的電影
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))

}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  // 習慣用有名稱的函式的話再找錯誤的時候比較好找
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
    // 因為id現在是字串，所以要用Number轉成數字
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

//分頁器的監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  //A 指的是分頁器的數字按鈕<a></a>  
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

//search bar的監聽表單提交事件
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //讓頁面不會刷新(重新導向目前頁面) 把控制權交給javascript
  event.preventDefault()
  console.log(searchInput.value)
  //新增input.value取值  trim()nji 刪除頭尾空白  toLowerCase()都轉換成小寫
  const keyword = searchInput.value.trim().toLowerCase()
  // // 使用 ! 為true
  // if (!keyword.length) {
  //   return alert('Please enter a valid string！')
  // }
  // //收尋使用for迴圈
  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }
  //第二種收尋的方法
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword)
  )

  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  // Array(80)
  movies.push(...response.data.results)
  // 也可以使用展開運算子movies.push(...response.data.results)來展開元素，將每一個數字變成一個物件
  // console.log(movies)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})
  .catch((err) => console.log(err))

