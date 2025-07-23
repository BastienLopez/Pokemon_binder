pokemon-binder/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── models/              # Pydantic & MongoDB models
│   │   ├── routes/              # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Auth, helpers
│   └── tests/                   # Tests unitaires backend
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/          # Composants UI
│   │   ├── pages/               # Pages principales
│   │   ├── services/            # Appels API
│   │   ├── utils/               # Helpers
│   │   └── App.jsx
│   └── tests/                   # Tests unitaires frontend
├── .env
├── README.md
├── docker-compose.yml
└── requirements.txt / package.json
