# GreenPath – An Intelligent API for Eco-Friendly Vehicle Routing

This is the main repository for the GreenPath project. It contains the FastAPI backend and a demonstration frontend dashboard.

## How to Run the Application

This project is now configured to run with a single command. The backend server will start and also serve the frontend files, so you do not need to use the "Live Server" extension.

### Step 1: Start the Server

1.  **Open a new terminal** in your code editor (like VS Code).
2.  **Navigate to the `backend` directory** by running this command:
    ```bash
    cd backend
    ```
3.  **Run the application** with the following command:
    ```bash
    ..\venv\Scripts\python.exe -m uvicorn app.main:app --reload
    ```
    *(This command tells Python from the `venv` environment to run the Uvicorn server for your main application.)*

4.  Keep this terminal open. The server will be running.

### Step 2: View the Application

1.  **Open your web browser** (like Chrome, Firefox, or Edge).
2.  Go to the following address:
    ```
    http://127.0.0.1:8000
    ```

That's it. The professional GreenPath application will load, and all features, including the location autocomplete, will be fully functional.

### Step 3: Use the Application

You can:
1.  Enter "London" in the "Start Location" field.
2.  Enter "Paris" in the "End Location" field.
3.  Click the **"Calculate Eco Route"** button.

The application will then communicate with your running backend server, calculate the route, and display it on the map along with the results.