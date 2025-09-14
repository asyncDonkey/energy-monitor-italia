# energy-monitor-italia

## 🚀 Running the Project with Docker Compose

This project is fully containerized, allowing you to run the entire application (backend data fetcher and frontend web server) with a single command.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Compose installed and running.
* Your own API credentials from the [Terna Developer Portal](https://dev.terna.it/).

### Instructions

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/asyncDonkey/energy-monitor-italia.git](https://github.com/asyncDonkey/energy-monitor-italia.git)
    cd energy-monitor-italia
    ```

2.  **Create a `.env` file**
    Create a file named `.env` in the root of the project and add your Terna credentials:
    ```
    TERNA_CLIENT_ID=YOUR_TERNA_CLIENT_ID
    TERNA_CLIENT_SECRET=YOUR_TERNA_CLIENT_SECRET
    ```

3.  **Build and Run the Application**
    ```bash
    docker compose up --build
    ```
    This command will build the images and start both the backend script and the frontend server. The script will run once to fetch the data, and the web server will remain active.

4.  **View the Dashboard**
    Open your web browser and navigate to **`http://localhost:8080`**.

5.  **Stopping the Application**
    To stop the web server, press `Ctrl + C` in the terminal, then run:
    ```bash
    docker compose down
    ```