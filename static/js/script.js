let aqiChart = null;

function setupSidebarInteraction(allStations) {
    const map = window.L_MAP;
    const listItems = document.querySelectorAll('#station-list li');

    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function() {
        const searchValue = this.value.toLowerCase();
        listItems.forEach(li => {
            const stationName = li.querySelector('span').innerText.toLowerCase();
            li.style.display = stationName.includes(searchValue) ? '' : 'none';
        });
    });

    // Station click and download handling
    listItems.forEach(li => {
        li.addEventListener('click', () => {
            const lat = parseFloat(li.getAttribute('data-lat'));
            const lon = parseFloat(li.getAttribute('data-lon'));
            map.setView([lat, lon], 12);
        });

        const select = li.querySelector('.download-format');
        li.querySelector('.aqi-badge').addEventListener('click', (e) => {
            e.stopPropagation();
            const stationId = li.getAttribute('data-id');
            const format = select.value;
            downloadStationData(stationId, format);
        });
    });

    // Insights modal toggle
    const insightsBtn = document.getElementById('toggle-insights');
    const insightModal = document.getElementById('insightModal');
    const closeInsightsBtn = document.getElementById('closeInsights');

    insightsBtn.addEventListener('click', () => {
        updateInsightsWithAllStations(allStations);
        insightModal.style.display = 'block';
    });
    
    closeInsightsBtn.addEventListener('click', () => {
        insightModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == insightModal) {
            insightModal.style.display = "none";
        }
    };

    // Download chart as JPG
    document.getElementById('downloadChartJpg').addEventListener('click', () => {
        if (!aqiChart) return alert("Chart not ready!");

        const pngUrl = aqiChart.toBase64Image();

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = "#fff"; // white background for JPG
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            const jpgUrl = canvas.toDataURL("image/jpeg", 0.95);

            const a = document.createElement('a');
            a.href = jpgUrl;
            a.download = 'Nepal_AQI_Chart.jpg';
            document.body.appendChild(a);
            a.click();
            a.remove();
        };
        img.src = pngUrl;
    });
}

function updateInsightsWithAllStations(allStations) {
    const labels = allStations.map(s => s.name);
    const data = allStations.map(s => s.aqi);

    const ctx = document.getElementById('aqiChart').getContext('2d');
    if (aqiChart) aqiChart.destroy();

    aqiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'AQI Value',
                data: data,
                backgroundColor: '#4caf50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.ceil(Math.max(...data) / 10) * 10,
                    ticks: { stepSize: 10 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Update temperature info
    const stationsWithTemp = allStations.filter(s => s.ow_temp !== undefined && !isNaN(s.ow_temp));

    if (stationsWithTemp.length > 0) {
        const maxTempStation = stationsWithTemp.reduce((max, s) => s.ow_temp > max.ow_temp ? s : max);
        const minTempStation = stationsWithTemp.reduce((min, s) => s.ow_temp < min.ow_temp ? s : min);

        document.getElementById('max-temp').textContent = `${maxTempStation.ow_temp} °C (${maxTempStation.name})`;
        document.getElementById('min-temp').textContent = `${minTempStation.ow_temp} °C (${minTempStation.name})`;
    } else {
        document.getElementById('max-temp').textContent = '--';
        document.getElementById('min-temp').textContent = '--';
    }
    document.getElementById('aqiChart').parentElement.style.height = `${40 + allStations.length * 20}px`;
}

function downloadStationData(stationId, format) {
    fetch(`/download/${stationId}?format=${format}`)
        .then(res => {
            if (!res.ok) throw new Error("Download failed");
            return res.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `station_${stationId}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => alert(err.message));
}

function downloadAllStations() {
    const format = document.getElementById('bulkFormat').value;
    const url = `/download/all?format=${format}`;

    fetch(url)
        .then(res => {
            if (!res.ok) throw new Error("Download failed");
            return res.blob();
        })
        .then(blob => {
            const a = document.createElement('a');
            const downloadUrl = window.URL.createObjectURL(blob);
            a.href = downloadUrl;
            a.download = `all_stations.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(downloadUrl);
        })
        .catch(err => alert(err.message));
}

document.addEventListener("DOMContentLoaded", function() {
    function setupSidebarInteraction(allStations) {
        // Your existing setup code here
        const searchBox = document.getElementById('searchBox');
        if (!searchBox) {
            console.error("Search box element not found!");
            return;
        }
        searchBox.addEventListener('input', function() {
            // Rest of your search functionality
        });
        
        // Rest of your setup code
    }

    // Only call this if allStations is defined
    if (typeof allStations !== 'undefined') {
        setupSidebarInteraction(allStations);
    }
});