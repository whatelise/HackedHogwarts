"use strict";
window.addEventListener("DOMContentLoaded", start);

let url = "https://petlatkea.dk/2021/hogwarts/students.json";
let familyListUrl = "https://petlatkea.dk/2021/hogwarts/families.json";

let filterBy = "all";
const settings = {
  filter: null,
  sortBy: null,
  sortDir: "asc",
};

const Student = {
  // _id: "",
  firstname: "",
  nickname: "",
  middlename: "",
  lastname: "",
  house: "",
  img: "",
  bloodstatus: "",
  prefect: false,
  expelled: false,
  inquisitorialsquad: false,
};

const allStudents = [];
const prefectList = [];
const houses = {
  Gryffindor: { prefects: [] },
  Slytherin: { prefects: [] },
  Hufflepuff: { prefects: [] },
  Ravenclaw: { prefects: [] },
};

let bloodStatusList;

function start() {
  console.log("ready");
  registerButtons();
  loadJSON();
}

function loadJSON() {
  fetch(familyListUrl)
    .then((response) => response.json())
    .then((data) => {
      // when loaded, prepare objects
      bloodStatusList = data;
      fetch(url)
        .then((response) => response.json())
        .then((jsonData) => {
          // when loaded, prepare objects
          prepareObjects(jsonData);
        });
    });
}

function prepareObjects(jsonData) {
  jsonData.forEach((jsonObject) => {
    const student = Object.create(Student);
    const fullname = jsonObject.fullname.trim();
    const firstSpace = fullname.indexOf(" ");
    const lastSpace = fullname.lastIndexOf(" ");
    // const nickname = fullname.indexOf("`");

    const firstname = fullname.substring(0, firstSpace);
    const lastname = fullname.substring(lastSpace + 1);
    const middlename = fullname.substring(firstSpace + 1, lastSpace);
    const nickname = getNickname(middlename);

    const newFirstName = firstname.substring(0, 1).toUpperCase() + firstname.substring(1).toLowerCase();
    const newLastName = lastname.substring(0, 1).toUpperCase() + lastname.substring(1).toLowerCase();
    const newMiddleName = middlename.substring(0, 1).toUpperCase() + middlename.substring(1).toLowerCase();
    const house = jsonObject.house.trim();

    const expelled = student.expelled;
    const prefect = student.prefect;

    student.firstname = newFirstName;
    student.lastname = newLastName;
    student.gender = jsonObject.gender.substring(0, 1).toUpperCase() + jsonObject.gender.substring(1).toLowerCase();
    student.house = house.substring(0, 1).toUpperCase() + house.substring(1).toLowerCase();
    student.middlename = newMiddleName;
    student.nickname = nickname;
    student.img = findImg(student);
    student.bloodstatus = bloodStatus(newLastName);
    // student._id = createID(n);
    allStudents.push(student);
    displayList(allStudents);
    // console.table(allStudents);
  });
}
function getNickname(middlename) {
  const initial = middlename.slice(0, 1);
  if (initial === '"') {
    length = middlename.length;
    const nickname = middlename.slice(1, length - 1);
    return nickname;
  }
}
function displayStudents(student) {
  const template = document.querySelector("template#studentprofile").content;
  const clone = template.cloneNode(true);

  clone.querySelector(".fullname").textContent = student.firstname + " " + student.middlename + " " + student.lastname;
  clone.querySelector(".house").textContent = student.house;
  clone.querySelector(".studentimg").src = "images/" + student.img;
  clone.querySelector(".studentprofile").addEventListener("click", setModal);

  function setModal(event) {
    openInfo(student);
    console.log("setmodal");
  }

  if (student.firstname === "") {
    clone.querySelector(".studentimg").classList.add("hidden");
    clone.querySelector(".blackbox").classList.remove("hidden");
  }
  if (student.house === "Slytherin") {
    clone.querySelector(".studentprofile").classList.add("slytherin");
  } else if (student.house === "Ravenclaw") {
    clone.querySelector(".studentprofile").classList.add("ravenclaw");
  } else if (student.house === "Gryffindor") {
    clone.querySelector(".studentprofile").classList.add("gryffindor");
  } else if (student.house === "Hufflepuff") {
    clone.querySelector(".studentprofile").classList.add("hufflepuff");
  }

  const parent = document.querySelector(".studentlist");
  parent.appendChild(clone);
}
function openInfo(student) {
  let modal = document.querySelector(".infopopup");
  modal.classList.remove("hidden");
  document.querySelector(".closepopup").addEventListener("click", () => {
    modal.classList.add("hidden");
  });
  modal.querySelector(".popupfullname").textContent = student.firstname + " " + student.middlename + " " + student.lastname;
  modal.querySelector(".popuphouse").textContent = student.house;
  modal.querySelector(".expell").addEventListener("click", expellStudent);
  function expellStudent() {
    student.expelled = true;
    buildList();
  }

  modal.querySelector(".expelled").textContent = `${student.expelled}`;
  modal.querySelector(".prefect").textContent = `${student.prefect}`;
  modal.querySelector(".bloodstatus").textContent = `${student.bloodstatus}`;
  if (student.house === "Slytherin") {
    modal.classList.add("slytherinpop");
  } else if (student.house === "Ravenclaw") {
    modal.classList.add("ravenclawpop");
  } else if (student.house === "Gryffindor") {
    modal.classList.add("gryffindorpop");
  } else if (student.house === "Hufflepuff") {
    modal.classList.add("hufflepuffpop");
  }

  modal.querySelector(".popupstudentimg").src = "images/" + student.img;
  modal.querySelector(".makeinquis").addEventListener("click", makeInquisitorial);
  modal.querySelector(".makeprefect").addEventListener("click", prefectStudent);
  function prefectStudent() {
    if (student.prefect === true) {
      student.prefect = false;
      // this.querySelector(".makeprefect").innerHTML = "Remove from Prefect";
    } else {
      student.prefect = true;
      prefectList.push(student);
      console.log(student.house);
    }
    if (prefectList.length > 2) {
      document.querySelector(".alertprefect").classList.remove("hidden");
      document.querySelector(".close").addEventListener("click", closeAlert);
      prefectList.pop(student);
    }
    console.log(prefectList);

    // console.log(prefectList.Object);
    // if (prefectList.student.house === "Slytherin" && prefectList.house > 2) {
    // }

    modal.querySelector(".makeprefect").removeEventListener("click", prefectStudent);
    openInfo(student);
    buildList();
  }
  modal.querySelector(".inquisitorialsquad").textContent = `${student.inquisitorialsquad}`;
  function makeInquisitorial() {
    modal.querySelector(".makeinquis").removeEventListener("click", makeInquisitorial);
    if (student.house === "Slytherin" || student.bloodstatus === "pure") {
      student.inquisitorialsquad = true;
    }
    buildList();
    openInfo(student);
  }
}

function findImg(student) {
  const urlFirstName = student.firstname.substring(0, 1).toLowerCase();
  const urlLastName = student.lastname.toLowerCase();
  const urlNewFirstName = student.firstname.toLowerCase();

  // const sameName = allStudents.find((student) => student.lastname === student.lastname);

  if (urlLastName.includes("-")) {
    const hyphen = urlLastName.substring(urlLastName.indexOf("-"));
    const hyphenLastName = hyphen.slice(1);
    const imgurl = `${hyphenLastName}_${urlFirstName}.png`;
    return imgurl;
  } else if (student.lastname === "Patil") {
    const imgurl = `${urlLastName}_${urlNewFirstName}.png`;
    return imgurl;
  } else {
    const imgurl = `${urlLastName}_${urlFirstName}.png`;
    return imgurl;
  }
}
function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);
  displayList(sortedList);
  displayCount(currentList);
}
function displayList(sad) {
  document.querySelector(".studentlist").innerHTML = "";
  sad.forEach(displayStudents);
}
function registerButtons() {
  document.querySelectorAll(".filter").forEach((value) => value.addEventListener("click", selectFilter));
  document.querySelectorAll(".sort").forEach((value) => value.addEventListener("click", selectSort));
  document.querySelector("#sortdirection").addEventListener("click", sortDirection);
}
function closeAlert() {
  document.querySelector(".alertprefect").classList.add("hidden");
}

//Filtering//
function selectFilter(event) {
  const filter = event.target.value;
  console.log(`User selected ${filter}`);
  setFilter(filter);
}
function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}
function filterList(filteredList) {
  if (settings.filterBy === "Slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  } else if (settings.filterBy === "Gryffindor") {
    filteredList = allStudents.filter(isGryffindor);
  } else if (settings.filterBy === "Hufflepuff") {
    filteredList = allStudents.filter(isHufflepuff);
  } else if (settings.filterBy === "Ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "Prefect") {
    filteredList = allStudents.filter(isPrefect);
  } else if (settings.filterBy === "Expelled") {
    filteredList = allStudents.filter(isExpelled);
  } else if (settings.filterBy === "Notexpelled") {
    filteredList = allStudents.filter(isNotExpelled);
  }
  return filteredList;
}
function isSlytherin(student) {
  return student.house === "Slytherin";
}
function isGryffindor(student) {
  return student.house === "Gryffindor";
}
function isHufflepuff(student) {
  return student.house === "Hufflepuff";
}
function isRavenclaw(student) {
  return student.house === "Ravenclaw";
}
function isPrefect(student) {
  return student.prefect === true;
}
function isExpelled(student) {
  return student.expelled === true;
}
function isNotExpelled(student) {
  return student.expelled === false;
}

//Sorting

function selectSort(event) {
  const sortBy = event.target.value;
  const sortDir = event.target.value.sortDirection;

  console.log(`User selected ${sortBy}`);
  setSort(sortBy, sortDir);
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  }
  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}
function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}
function sortDirection(e) {
  settings.sortDir = e.target.dataset.sortDirection;

  if (settings.sortDir === "asc") {
    e.target.dataset.sortDirection = "desc";
  } else {
    e.target.dataset.sortDirection = "asc";
  }
  this.removeEventListener("click", sortDirection);
  registerButtons();
  buildList();
}

function bloodStatus(lastName) {
  let bloodType;
  if (lastName) {
    bloodType = "muggle";
    if (bloodStatusList.pure.includes(lastName)) {
      bloodType = "pure";
    }
    if (bloodStatusList.half.includes(lastName)) {
      bloodType = "half";
    }
  }
  return bloodType;
}

function displayCount(currentList) {
  // const listCount = sortedList.length;
  document.querySelector(".counterNumber").innerHTML = currentList.length;
}
// 👑 "U+1F451"
// 🩸 "U+1FA78"
