// Modal
const modal = document.getElementById("cryptoModal");
const span = document.getElementsByClassName("close")[0];

// Close modal when the user clicks on <span> (x)
span.onclick = function() {
  modal.style.display = "none";
}

// Close modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Function to open the modal and display the price trend
function openModal(cryptoName, cryptoId) {
  document.getElementById("modalCryptoName").innerText = cryptoName;
  modal.style.display = "block";
  fetchPriceTrend(cryptoId);
}

// Fetch and display the price trend using Chart.js
async function fetchPriceTrend(cryptoId) {
  // Dummy data for demonstration, replace with actual API call
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=7`);
  const data = await response.json();
  const prices = data.prices.map(item => ({ t: new Date(item[0]), y: item[1] }));

  const ctx = document.getElementById('priceTrendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Price Trend',
        data: prices,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          }
        },
        y: {
          beginAtZero: false
        }
      }
    }
  });
}

// Attach event listeners to the cryptocurrency elements
function attachEventListeners() {
  const cryptoPricesDiv = document.getElementById('crypto-prices');
  cryptoPricesDiv.addEventListener('click', function(event) {
    const target = event.target.closest('.crypto');
    if (target) {
      const cryptoName = target.querySelector('.crypto-name').innerText;
      const cryptoId = target.getAttribute('data-crypto-id');
      openModal(cryptoName, cryptoId);
    }
  });
}

// Modify displayCryptoPrices function to include data-crypto-id attribute
function displayCryptoPrices(prices) {
  const cryptoPricesDiv = document.getElementById('crypto-prices');
  cryptoPricesDiv.innerHTML = '';

  const cryptoData = [
    { id: 'bitcoin', name: 'Bitcoin (BTC)', icon: 'icons/bitcoin.png' },
    { id: 'ethereum', name: 'Ethereum (ETH)', icon: 'icons/ethereum.png' },
    // ... (other cryptocurrencies)
  ];

  cryptoData.forEach(crypto => {
    if (prices[crypto.id]) {
      const price = prices[crypto.id].usd;

      const cryptoDiv = document.createElement('div');
      cryptoDiv.className = 'crypto';
      cryptoDiv.setAttribute('data-crypto-id', crypto.id);

      const cryptoNameDiv = document.createElement('div');
      cryptoNameDiv.className = 'crypto-name';
      cryptoNameDiv.innerHTML = `<img src="${crypto.icon}" alt="${crypto.name}"> ${crypto.name}`;

      const cryptoPriceDiv = document.createElement('div');
      cryptoPriceDiv.className = 'crypto-price';
      cryptoPriceDiv.textContent = `$${price.toFixed(2)}`;

      cryptoDiv.appendChild(cryptoNameDiv);
      cryptoDiv.appendChild(cryptoPriceDiv);
      cryptoPricesDiv.appendChild(cryptoDiv);
    }
  });

  attachEventListeners();
}

// Fetch and display the prices every 60 seconds
fetchCryptoPrices();
setInterval(fetchCryptoPrices, 60000);
