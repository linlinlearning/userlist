// 變數資料
const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const dataPanel = document.querySelector("#data-panel")
const userList = [] // 從 API 存取到的初始 user 名單 (200 人)
const paginator = document.querySelector('#paginator') // 分頁器
const USERS_Per_Page = 20 // 每頁顯示的 user 數量
const languageSelect = document.querySelector('#language-select') // 語言的下拉選單

let usersFilteredByLang = [] // 依照語言篩選過的名單


// 以下為 search 功能的相關變數
const filterForm = document.querySelector('#filter-form')
const searchInputBox = document.querySelector('#search-input')
let filteredUsers = []
let userEmailSlicedSet = []

// 區域代碼與語言轉換對照 (例如，區域為 DK 的 user，語言為 Danish)
const langTable = {
  DK: 'Danish',
  CH: 'German & French',
  AU: 'English',
  CA: 'English & French',
  DE: 'German',
  BR: 'Portuguese',
  US: 'English',
  NO: 'Norwegian',
  TR: 'Turkish',
  ES: 'Spanish',
  FI: 'Finnish',
  NZ: 'English',
  DZ: 'Arabic',
  NL: 'Dutch',
  IR: 'Persian',
  IE: 'English',
  GB: 'English',
  FR: 'French',
}

// 區域代碼與完整名稱轉換對照 (例如，區域代碼為 DK，完整名稱為 Denmark)
const regionTable = {
  DK: 'Denmark',
  CH: 'Switzerland',
  AU: 'Australia',
  CA: 'Canada',
  DE: 'Germany',
  BR: 'Brazil',
  US: 'US',
  NO: 'Norway',
  TR: 'Turkey',
  ES: 'Spain',
  FI: 'Finland',
  NZ: 'New Zealand',
  DZ: 'Algeria',
  NL: 'The Netherlands',
  IR: 'Iran',
  IE: 'Ireland',
  GB: 'UK',
  FR: 'France',
}


// 函式 1: 輸出 users
function renderUsers(data) {
  let rawHTML = "";
  data.forEach(function (user) {
    rawHTML += `
      <div class="card" data-modal-user-id="${user.id}">
        <img class="card-img-top user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal" src="${user.avatar}" alt="Card image" data-modal-user-id="${user.id}">
        <div class="card-body container" data-modal-user-id="${user.id}">
          <h6 class="card-title mb-0" data-bs-toggle="modal" data-bs-target="#user-modal" data-modal-user-id="${user.id}">${user.name} ${user.surname}</h6>
          <span class="teaches-languages">${langTable[user.region]}</span>
          <span class="btn-add-favorite card-btn-span" data-bs-toggle="tooltip" title="Add to Favorite" data-modal-user-id="${user.id}"><i class="fas fa-plus-square fa-lg card-btn btn-add-favorite"  data-bs-placement="top"  data-modal-user-id="${user.id}"></i> Add</span>
        </div>
      </div>
  `
  })
  dataPanel.innerHTML = rawHTML;
}

/*
// 函式 2：每頁只輸出部份的 users
function getUsersByPage(page) {
  // 判斷 data 要用什麼：如果有 usersFilteredByLang (用語言篩選過的名單)，就用這個，沒有的話就用 userList
  const data = usersFilteredByLang.length ? usersFilteredByLang : userList
  startIndex = (page - 1) * USERS_Per_Page
  return data.slice(startIndex, startIndex + USERS_Per_Page)
}
*/
//函式 2：每頁只輸出部份的 users
function getUsersByPage(page) {
  // 判斷 data 要用什麼：如果有篩選過的名單，就用這個，沒有的話就用 userList
  const data = filteredUsers.length ? filteredUsers : userList
  startIndex = (page - 1) * USERS_Per_Page
  return data.slice(startIndex, startIndex + USERS_Per_Page)
}



// 函式 3：輸出分頁器的結構
// userAmount 是總人數
function renderPaginator(userAmount) {
  // 分頁器的數量 (頁數) 等於總人數除以每頁要顯示的人數
  const numberOfPages = Math.ceil(userAmount / USERS_Per_Page)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}


// 函式 4：顯示 user 詳細資料 (modal)
function showMoreUserInfo(id) {
  const modalContent = document.querySelector('.modal-content')
  const modalTitleBox = document.querySelector(".modal-title")
  const modalAvatarBox = document.querySelector(".modal-avatar")
  const modalUserInfoBox = document.querySelector(".modal-user-info")

  // 每次執行前，先將 modal 內容清空，以免前一個 user 的資料殘影還在
  modalTitleBox.textContent = ""
  modalAvatarBox.src = ""
  modalUserInfoBox.textContent = ""

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const user = response.data
      modalTitleBox.textContent = user.name + " " + user.surname // modal 視窗標題為姓名
      modalAvatarBox.src = user.avatar // 照片

      // 用生日算出星座
      let userStarSign = getStarSign(user.birthday)

      // 顯示詳細資料：1.轉換後的完整區域名稱 2.星座 3.email
      modalUserInfoBox.innerHTML = `
      <p><i class="fas fa-map-marker-alt"></i> ${regionTable[user.region]}</p>
      <p><i class="fas fa-star"></i> ${userStarSign}</p>
      <p><i class="fas fa-envelope"></i> ${user.email}</p>
      `;
    })
    .catch((error) => console.log(error))
}


// 函式 5：加到最愛
function addToFavorite(id) {
  console.log(id)
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = userList.find((user) => user.id === id)

  // 若重複加同一 user 到最愛，發出提示訊息
  if (list.some((user) => user.id === id)) {
    return alert('This teacher is already in your Favorite List! :D')
  }

  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}


// 函式 6：依區域分配每個 user 所教的語言
function assignLanguage(data) {
  for (let i = 0; i < data.length; i++) {
    data[i].language = langTable[data[i].region]
  }
}


// 函式 7：篩選 user，依照語言選單和搜尋的關鍵字
function filterUsers(data) {
  const selectedLang = languageSelect.value
  const keyword = searchInputBox.value.trim().toLowerCase()
  // 篩選出教 selectedLang 的 user，若選的是 All，則指向原資料
  filteredUsers = selectedLang === 'All' ? data : data.filter(user => user.language.includes(selectedLang))

  // 篩選出名字或 email 包含 keyword 的 user
  filteredUsers = filteredUsers.filter(user => {
    const userFullName = (user.name + ' ' + user.surname).toLowerCase()
    const userEmailStart = user.email.slice(0, user.email.indexOf('@'))
    return userFullName.includes(keyword) || userEmailStart.includes(keyword)
  })

  // 如果沒有符合上述語言 & keyword 的 user，顯示提醒訊息 
  if (filteredUsers.length === 0) {
    return alert("Oops!\nNo matching teachers found! ><")
  }

  // 根據 filteredUsers 顯示分頁器以及渲染首頁資料
  renderPaginator(filteredUsers.length)
  renderUsers(getUsersByPage(1))
}


// 監聽器 1: dataPanel (顯示 user 詳細資料，或加到最愛)
dataPanel.addEventListener("click", function onDataPanelClick(event) {
  if (event.target.matches('.user-avatar') || event.target.matches('.card-title')) {
    showMoreUserInfo(Number(event.target.dataset.modalUserId))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.modalUserId))
  }
})


// 監聽器 2: 按下頁碼，輸出該頁的 users
paginator.addEventListener('click', function onPaginatorClick(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return
  //透過 dataset 取得被點擊的頁碼
  const page = Number(event.target.dataset.page)
  renderUsers(getUsersByPage(page))
})


// 監聽器 3：整合語言和 search bar 篩選 user，綁定元素是 <form>，因為它是語言選單 <select> 以及 search bar <input> 的父元素，可以監聽兩者的變化 (input event)
// input 事件可監聽 <input> 和 <select> 內容的變化
filterForm.addEventListener('input', () => {
  filterUsers(userList)
})


// 初始頁面
axios
  .get(INDEX_URL)
  .then(function (response) {
    //回傳的 results 是一個陣列，有 200 個物件元素，每一物件都是一位 user 的資料，用展開運算子的方法，把每個元素用 push 加進 userList 這個陣列
    userList.push(...response.data.results)

    // 呼叫上方的函式，此時 userList 已經有 200 筆 user 的資料
    // 依 userList 的人數輸出分頁器和首頁
    renderPaginator(userList.length)
    renderUsers(getUsersByPage(1))
    // console.log(userList)
    //分配語言
    assignLanguage(userList)
  })
  .catch(function (error) {
    console.log(error);
  });

// 函式: 計算星座
let starSign = ''
function getStarSign(date) {
  starSign = ''
  // 截取月份，月為日期字串中的 index 5~6 (例如 1998-12-31 中的 12)
  let month = date.slice(5, 7)

  // 截取日，日為日期字串中的 index 8~9 (例如 1998-12-31 中的 31)
  let day = Number(date.slice(8, 10))

  // 若有缺月或日，則星座為 N/A
  if (!month || !day) starSign = 'N/A'

  // 依月和日判斷星座，例如 12 月的 1 ~ 21 號為射手座 (Sagittarius)，22 號以後為摩羯座 (Capricorn)
  if (month === "12") {
    if (1 <= day < 22) starSign = "Sagittarius"
    else starSign = "Capricorn";
  } else if (month === "01") {
    if (1 <= day < 20) starSign = "Capricorn"
    else starSign = "Aquarius";
  } else if (month === "02") {
    if (1 <= day < 19) starSign = "Aquarius"
    else starSign = "Pisces";
  } else if (month === "03") {
    if (1 <= day < 21) starSign = "Pisces"
    else starSign = "Aries";
  } else if (month === "04") {
    if (1 <= day < 20) starSign = "Aries"
    else starSign = "Taurus";
  } else if (month === "05") {
    if (1 <= day < 21) starSign = "Taurus"
    else starSign = "Gemini";
  } else if (month === "06") {
    if (1 <= day < 21) starSign = "Gemini"
    else starSign = "Cancer";
  } else if (month === "07") {
    if (1 <= day < 23) starSign = "Cancer"
    else starSign = "Leo";
  } else if (month === "08") {
    if (1 <= day < 23) starSign = "Leo"
    else starSign = "Virgo";
  } else if (month === "09") {
    if (1 <= day < 23) starSign = "Virgo"
    else starSign = "Libra";
  } else if (month === "10") {
    if (1 <= day < 23) starSign = "Libra"
    else starSign = "Scorpio";
  } else if (month === "11") {
    if (1 <= day < 22) starSign = "Scorpio"
    else starSign = "Sagittarius"
  } else starSign = 'N/A'  // 若月和日不在以上範圍，則星座為 N/A

  return starSign;
}

