const userTab=document.querySelector("[data-user]");
const searchTab=document.querySelector("[data-search]");
const userContainer=document.querySelector(".weather-container");
const grantLocCon=document.querySelector(".g-l-c");
const formContainer=document.querySelector(".form-container");
const loadingContainer=document.querySelector(".loading-container");
const userInfoContainer=document.querySelector(".user-info-container");
const parameterContainer=document.querySelector(".parameter-container");

// initial variable

const apiKey= "5283bf8363e153d8f6baebe40e32a668";
let currTab=userTab;
currTab.classList.add("curr-tab");


getfromSessionStrorage();

function switchTab(clickedTab){

    if(clickedTab!=currTab){
        currTab.classList.remove("curr-tab");
        currTab=clickedTab;
        currTab.classList.add("curr-tab");

        if(!formContainer.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantLocCon.classList.remove("active");
            errorContainer.style.display = 'none';
            formContainer.classList.add("active");
        }
        else{
            formContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorContainer.style.display = 'none';
            getfromSessionStrorage();
            
        }
    }
}

userTab.addEventListener("click",()=>{
    //pass clicked tab as parameter
    switchTab(userTab);
});

searchTab.addEventListener("click",()=>{
    //pass clicked tab as parameter
    switchTab(searchTab);
});

//check is coordinates are already present or not
function getfromSessionStrorage(){

    const localCoordinate = sessionStorage.getItem("user-coor");
    if(!localCoordinate){
        grantLocCon.classList.add("active");
    }
    else{
        const coordinates=JSON.parse(localCoordinate);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(para) {
    const {lat,lon}=para;
    //make glc invisible

    grantLocCon.classList.remove("active");

    //loader visible
    loadingContainer.classList.add("active");

    //api call

    try{
        const response= await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data=await response.json();

        loadingContainer.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        loadingContainer.classList.remove("active");
        console.error('Error fetching weather data:', err);
        alert('Failed to fetch weather data. Please try again.');
    }
}

function renderWeatherInfo(weatherInfo){
    //fetch HTML elements

    const cityName=document.querySelector("[data-cityname]");
    const countryIcon=document.querySelector("[data-country-flag]");
    const desc=document.querySelector("[data-desc]");
    const weatherIcon=document.querySelector("[data-weather-icon]");
    const temp=document.querySelector("[data-temp]");
    const windSpeed=document.querySelector("[data-wind]");
    const humidity=document.querySelector("[data-humidity]");
    const cloud=document.querySelector("[data-cloud]");

    //fetch values from weatherInfo object and put in ui element
    cityName.innerHTML = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerHTML = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerHTML = `${weatherInfo?.main?.temp} ℃`;
    windSpeed.innerHTML = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerHTML = `${weatherInfo?.main?.humidity}%`;
    cloud.innerHTML = `${weatherInfo?.clouds?.all}%`;

}

function getLocation(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        // alert
        alert("Geolocation is not supported by this browser.");
    }

}

function showPosition(position) {
    const userCoor = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coor", JSON.stringify(userCoor));
    fetchUserWeatherInfo(userCoor);
}


const grantAccessBtn=document.querySelector("[grant-access]");
grantAccessBtn.addEventListener('click',getLocation);


const searchInput=document.querySelector("[data-input]");

formContainer.addEventListener('submit',(e)=>{
    e.preventDefault();
    let cityn = searchInput.value.trim();
    if(cityn===""){
        return;
    }
    else{
        fetchSearchWeatherInfo(cityn);
        
    }

});

const errorContainer = document.createElement('div');
errorContainer.classList.add('error-container');
userContainer.appendChild(errorContainer);


async function fetchSearchWeatherInfo(city){
    loadingContainer.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantLocCon.classList.remove("active");
    errorContainer.style.display = 'none';  // Hide the error container by default

    
    try{
        const response=await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data= await response.json();
        if(data.cod==="404"){
            loadingContainer.classList.remove("active");
            showError();
        }
        else{
            loadingContainer.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
    }
    catch(err){
        loadingContainer.classList.remove("active");
        console.error('Error fetching weather data:', err);
        alert('Failed to fetch weather data. Please check the city name or try again later.');
    }
   finally {
    searchInput.value = '';  
   }

}

function showError() {
    errorContainer.style.display = 'block';
    errorContainer.innerHTML = `
        <img src="./assets/not-found.png" alt="Error" width="400" height="400">
        <p>City not found. Please try again.</p>
    `;
    errorContainer.style.textAlign = 'center';
    errorContainer.style.color = 'red';
}