# EcoRoute Project Structure

This document outlines the directory and file structure for the EcoRoute project.

## Root Directory

```
ecoroute/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       └── endpoints/
│   │   │           ├── __init__.py
│   │   │           └── routing.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── data_fetch.py
│   │   │   └── route_calculator.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── route.py
│   │   └── schemas/
│   │       ├── __init__.py
│   │       └── route.py
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── data/
│   └── datasets/
│       └── export-hbefa.csv
├── docs/
│   └── api_documentation.md
├── .gitignore
└── README.md
```

## Component Descriptions

### `backend/`
- Contains the FastAPI application.
- **`app/`**: The main application module.
  - **`main.py`**: The entry point for the FastAPI application.
  - **`api/`**: API versioning and endpoint definitions.
  - **`core/`**: Core application settings, like configuration.
  - **`services/`**: Business logic, including the `data_fetch` and `route_calculator` modules.
  - **`models/`**: Database models (SQLAlchemy).
  - **`schemas/`**: Pydantic schemas for data validation and serialization.
- **`requirements.txt`**: Python dependencies.
- **`Dockerfile`**: For containerizing the backend application.

### `frontend/`
- A simple HTML, CSS, and JavaScript frontend for demonstration purposes.
  - **`index.html`**: The main page.
  - **`css/style.css`**: Styles for the dashboard.
  - **`js/app.js`**: JavaScript to interact with the backend API.

### `data/`
- Stores data files, such as the `export-hbefa.csv` emissions dataset.

### `docs/`
- Project documentation, including API specifications.

### `.gitignore`
- Specifies files and directories to be ignored by Git.

### `README.md`
- The main project README file with an overview and setup instructions.