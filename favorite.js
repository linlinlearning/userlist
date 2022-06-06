// 變數資料
const BASE_URL = "https://lighthouse-user-api.herokuapp.com"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const dataPanel = document.querySelector("#data-panel")
const userList = JSON.parse(localStorage.getItem('favoriteUsers')) || [] // 從 local storage 存取到最愛名單
const USERS_Per_Page = 20 // 每頁顯示的 user 數量

// 以下為 search 功能的相關變數，此階段不會使用到
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
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
       <div class="card" >
        <img class="card-img-top user-avatar" data-bs-toggle="modal" data-bs-target="#user-modal" src="${user.avatar}" alt="Card image" data-modal-user-id="${user.id}">
        <div class="card-body container" data-modal-user-id="${user.id}">
          <h6 class="card-title mb-0" data-bs-toggle="modal" data-bs-target="#user-modal" data-modal-user-id="${user.id}">${user.name} ${user.surname}</h6>
          <span class="teaches-languages">${langTable[user.region]}</span>
          <span class="btn-remove-favorite card-btn-span" data-bs-toggle="tooltip" title="Remove from Favorite" data-modal-user-id="${user.id}"><i class="fas fa-minus-square fa-lg card-btn btn-remove-favorite" data-bs-toggle="tooltip" data-bs-placement="top" title="Remove from Favorite" data-modal-user-id="${user.id}"></i> Remove</span>
        </div>
      </div>
  `
  })
  dataPanel.innerHTML = rawHTML;
}

// 函式 2：顯示 user 詳細資料 (modal)
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
      modalTitleBox.textContent = user.name + " " + user.surname
      modalAvatarBox.src = user.avatar

      //用生日算出星座
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


// 函式 3：移出最愛
function removeFromFavorite(id) {
  if (!userList || !userList.length) return
  const userIndex = userList.findIndex((user) => user.id === id)
  if (userIndex === -1) return
  userList.splice(userIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(userList))
  renderUsers(userList)
}


//監聽器 1: dataPanel (顯示 user 詳細資料，或移出最愛)
dataPanel.addEventListener("click", function onDataPanelClick(event) {
  if (event.target.matches('.user-avatar') || event.target.matches('.card-title')) {
    showMoreUserInfo(Number(event.target.dataset.modalUserId))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.modalUserId))
  }
})


// 輸出初始頁面
renderUsers(userList)



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