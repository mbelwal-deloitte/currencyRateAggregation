# Live Currency Rate Aggregation and Trend Dashboard

A real-time web application that aggregates currency exchange rates and displays trends with interactive visualizations.

## Features

- Live currency rate aggregation from multiple API sources
- Real-time dashboard updates using Azure SignalR
- Interactive trend visualization (daily, weekly, monthly)
- Secure API communication
- Scalable architecture supporting 100+ concurrent users

## Technology Stack

### Backend
- Python with FastAPI
- Azure Functions
- Azure Cosmos DB
- Azure SignalR Service

### Frontend
- React with TypeScript
- Chart.js for visualizations
- Material-UI for components

### Security
- HTTPS enabled
- Secure API key management
- Azure Key Vault integration

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Azure account
- Azure CLI

### Installation

1. Clone the repository
2. Set up backend:
   ```bash
   cd backend
   python -m venv venv
   # Activate virtual environment:
   # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Set up frontend:
   ```bash
   cd frontend
   npm install
   ```

4. Configure environment variables (create .env files in both backend and frontend directories)

### Running the Application

1. Start the backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

## Performance Metrics

- Dashboard load time: < 3 seconds
- API response time: < 1 second
- Auto-refresh interval: 30 seconds
- Availability: 99.9% uptime

## API Integration

The application integrates with the following currency rate APIs:
- https://2025-06-18.currency-api.pages.dev/v1/currencies/usd.json
- https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@2025-06-18/v1/currencies/usd.json

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.