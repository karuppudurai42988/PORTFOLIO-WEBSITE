document.addEventListener('DOMContentLoaded', () => {
  const weatherForm = document.getElementById('weather-form');
  const cityInput = document.getElementById('city-input');
  const weatherStatus = document.getElementById('weather-status');
  const weatherDisplay = document.getElementById('weather-display');

  const infoTemp = document.getElementById('info-temp');
  const infoDesc = document.getElementById('info-desc');
  const infoHumidity = document.getElementById('info-humidity');
  const infoWind = document.getElementById('info-wind');
  const infoLocation = document.getElementById('info-location');

  weatherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();

    if (!city) {
      updateStatus('Please type a target city location name before fetching.', '#c53030');
      return;
    }

    updateStatus('Connecting to API node and fetching telemetry...', 'var(--text-main)');
    weatherDisplay.style.display = 'none'; 

    try {
      const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      if (!response.ok) {
        throw new Error('Target location could not be resolved by server cluster.');
      }
      const data = await response.json();
      renderWeatherData(data);

    } catch (error) {
      console.error('API Error Trace:', error);
      updateStatus(`Network Error: ${error.message} Please check spelling and try again.`, '#c53030');
    }
  });
  function renderWeatherData(data) {
    try {
      const currentCondition = data.current_condition[0];
      const areaInfo = data.nearest_area[0];

      const temperatureCelsius = currentCondition.temp_C;
      const conditionText = currentCondition.weatherDesc[0].value;
      const humidityPercentage = currentCondition.humidity;
      const windSpeedKmh = currentCondition.windspeedKmph;
      
      const cityName = areaInfo.areaName[0].value;
      const countryName = areaInfo.country[0].value;

      infoTemp.textContent = `${temperatureCelsius}°C`;
      infoDesc.textContent = conditionText;
      infoHumidity.textContent = `${humidityPercentage}%`;
      infoWind.textContent = `${windSpeedKmh} Km/h`;
      infoLocation.textContent = `${cityName}, ${countryName}`;

      updateStatus('Data telemetry stream successfully parsed.', 'var(--accent-primary)');
      weatherDisplay.style.display = 'grid'; 

    } catch (parseError) {
      console.error('JSON Structure Processing Fault:', parseError);
      updateStatus('Data processing failure: received unexpected JSON data payload properties.', '#c53030');
    }
  }

  function updateStatus(text, color) {
    weatherStatus.textContent = text;
    weatherStatus.style.color = color;
  }
});