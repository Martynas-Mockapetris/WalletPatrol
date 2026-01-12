# 💰 WalletPatrol

**Asmeninis išlaidų sekiklis** - MERN stack aplikacija su Vite ir MongoDB

## 📋 Funkcionalumas

- ✅ Login sistema su JWT autentifikacija
- ✅ Interaktyvus kalendorius su išskleistomomis dienomis
- ✅ Išlaidų ir įplaukų sekimas
- ✅ Mėnesio grafas su balansu (žalia/raudona)
- ✅ Komentarai prie kiekvienos transakcijos
- ✅ Realtime duomenų sinchronizacija

## 🏗️ Projekto Struktūra

```
WalletPatrol/
├── front/                 # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── server/                # Express + MongoDB backend
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   └── server.js
├── .gitignore
└── README.md
```

## 🚀 Pradžia

### Front'e (Vite React):
```bash
cd front
npm install
npm run dev
```

### Server'yje (Express):
```bash
cd server
npm install
npm run dev
```

## 📦 Naudojamos Technologijos

- **Frontend**: React + Vite + Axios
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **Auth**: JWT
- **Styling**: CSS/Tailwind

## 📝 Git Workflow

Kiekviena funkcija = naujas branch + commit po to dėti į main

---

**Pradžia**: 2026-01-12 | **Versija**: 0.1.0
