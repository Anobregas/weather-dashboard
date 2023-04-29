
// select DOM elements
const cityFormEl = document.querySelector('#city-form');
const cityInputEl = document.querySelector('#city-input');
const searchHistoryEl = document.querySelector('#search-history');
const currentWeatherEl = document.querySelector('#current-weather');
const futureWeatherEl = document.querySelector('#future-weather');
let currentTime = dayjs()//.tz();
// configure Day.js to use UTC and local timezone
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);
dayjs.tz.setDefault('America/New_York');

// create an array to store search history
let searchHistory = [];

// function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault();
  const cityName = cityInputEl.value.trim();
  if (!cityName) return;

  // fetch current weather data
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=cc4496aafcd2900ef57cbab9a41da868`)
    .then(response => response.json())
    .then(data => {

      const city = data.name;
      
      // get current time for forecast
      // let currentTime = dayjs().tz();
      
      // add city to search history
      if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        searchHistoryEl.innerHTML += `<button>${city}</button>`;
      }

      // fetch 5-day forecast data
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=cc4496aafcd2900ef57cbab9a41da868`);
    })
    .then(response => response.json())
    .then(data => {
      // display 5-day forecast data for current time
      const forecast = data.list.filter(item => dayjs.unix(item.dt).tz().isSame(currentTime, 'hour')); // filter for current hour
      let forecastHtml = '';
      forecast.forEach(item => {
        const date = dayjs.unix(item.dt).tz().format('MMMM D, YYYY h:mm A z');
        const icon = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;
        const temp = Math.round((item.main.temp - 273.15) * 9/5 + 32); // convert to Fahrenheit
        const humidity = item.main.humidity;
        const windSpeed = item.wind.speed;
        forecastHtml += `
          <div>
            <h3>${date} <img src="${icon}" alt="${item.weather[0].description}"></h3>
            <p>Temperature: ${temp} °F</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} MPH</p>
          </div>
        `;
      });
      futureWeatherEl.innerHTML = forecastHtml;
    })
    .catch(error => {
      console.error(error);
      currentWeatherEl.textContent = 'Error fetching data. Please try again later.';
    });
}

// function to handle search history button click
function handleSearchHistoryClick(event) {
  const cityName = event.target.textContent;
  cityInputEl.value = cityName;
  handleFormSubmit(event);
}


// add event listeners
cityFormEl.addEventListener('submit', handleFormSubmit);
searchHistoryEl.addEventListener('click', handleSearchHistoryClick);
