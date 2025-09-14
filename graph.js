// graph.js

// Variabili globali per conservare i dati e l'istanza del grafico
let allData = [];
let chartInstance = null;

// Funzione per calcolare e visualizzare le metriche chiave (KPI)
function calculateAndDisplayKPIs(selectedZone) {
    // --- 1. Top Consuming Zone (Overall) ---
    const peakZoneNameEl = document.getElementById('peakZoneName');
    if (peakZoneNameEl.textContent === '--') {
        const consumptionByZone = allData.reduce((acc, curr) => {
            
            if (curr.bidding_zone !== 'Italy') {
                acc[curr.bidding_zone] = (acc[curr.bidding_zone] || 0) + curr.total_load_MW;
            }
            return acc;
        }, {});
        
        let maxConsumption = 0;
        let topZone = 'N/A';
        for (const zone in consumptionByZone) {
            if (consumptionByZone[zone] > maxConsumption) {
                maxConsumption = consumptionByZone[zone];
                topZone = zone;
            }
        }
        peakZoneNameEl.textContent = topZone;
        document.getElementById('peakZoneValue').textContent = `${Math.round(maxConsumption).toLocaleString('en-US')} MW (Total)`;
    }

    // 2. Peak Time for the SELECTED Zone
    const zoneData = allData.filter(d => d.bidding_zone === selectedZone);
    if (zoneData.length > 0) {
        const peakRecordForZone = zoneData.reduce((max, current) => 
            current.total_load_MW > max.total_load_MW ? current : max
        );
        const peakTime = new Date(peakRecordForZone.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        document.getElementById('selectedZonePeakTime').textContent = peakTime;
    }

    // 3. Peak Time for "Italy"
    const italyPeakTimeEl = document.getElementById('italyPeakTime');
    if (italyPeakTimeEl.textContent === '--') {
        const italyData = allData.filter(d => d.bidding_zone === 'Italy');
        if (italyData.length > 0) {
            const peakRecordForItaly = italyData.reduce((max, current) => 
                current.total_load_MW > max.total_load_MW ? current : max
            );
            const peakTimeItaly = new Date(peakRecordForItaly.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            italyPeakTimeEl.textContent = peakTimeItaly;
        }
    }
}

// Funzione per aggiornare il grafico con i dati di una zona specifica
function updateChart(selectedZone) {
    const zoneData = allData.filter(d => d.bidding_zone === selectedZone);
    const labels = zoneData.map(d => {
        const date = new Date(d.date);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    });
    const values = zoneData.map(d => d.total_load_MW);

    // Se il grafico non è ancora stato creato
    if (!chartInstance) {
        const ctx = document.getElementById('loadChart').getContext('2d');
        
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Total Load ${selectedZone} (MW)`,
                    data: values,
                    borderColor: 'rgba(26, 35, 126, 1)',
                    backgroundColor: 'rgba(26, 35, 126, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: { display: true, text: 'National Electric Load Trend' },
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Megawatts (MW)' }
                    },
                    x: {
                        title: { display: true, text: 'Time of Day' }
                    }
                }
            }
        });
    } else {
        // Se il grafico esiste già, aggiorniamo solo i suoi dati
        chartInstance.data.labels = labels;
        chartInstance.data.datasets[0].data = values;
        chartInstance.data.datasets[0].label = `Total Load ${selectedZone} (MW)`;
        chartInstance.update(); // Aggiorna il grafico senza ridisegnarlo da capo
    }
    
    // Calcola e visualizza le metriche
    calculateAndDisplayKPIs(selectedZone);
}

// Funzione di inizializzazione
async function init() {
    try {
        const response = await fetch('dati/carico_elettrico.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allData = await response.json();

        const zoneSelector = document.getElementById('zoneSelector');
        const uniqueZones = [...new Set(allData.map(item => item.bidding_zone))].sort();
        
        uniqueZones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone;
            option.textContent = zone;
            zoneSelector.appendChild(option);
        });

        zoneSelector.addEventListener('change', (event) => {
            updateChart(event.target.value);
        });

        const initialZone = uniqueZones.includes('Italy') ? 'Italy' : uniqueZones[0];
        zoneSelector.value = initialZone;
        updateChart(initialZone);

    } catch (error) {
        console.error("Could not load or process data:", error);
        alert("Failed to load data. Please try again later.");
    }
}

// Esegui la funzione di inizializzazione
init();