# Ville CV AI

Interaktiivinen CV-verkkosivusto, jossa on tekoälypohjainen keskustelutoiminto.

Sivuston AI-chat käyttää paikallisesti Windows-koneella ajettavaa Ollama-LLM:ää. Julkinen verkkosivusto ja API ovat Azure Static Web Apps -ympäristössä, ja Azure Function välittää AI-pyynnöt suojatun Tailscale Funnel -yhteyden kautta omalle Ollama-palvelimelle.

## Teknologiat

* HTML
* CSS
* JavaScript
* Node.js
* Azure Static Web Apps
* Azure Functions
* GitHub Actions
* Ollama
* Qwen 2.5 7B
* Tailscale Funnel
* PowerShell

## Arkkitehtuuri

```text
Internet
   │
   ▼
Azure Static Web Apps
   │
   ├── Frontend
   │
   └── Azure Functions
          │
          │ HTTPS + API key
          ▼
     Tailscale Funnel
          │
          ▼
     Ollama Proxy
          │
          ▼
     Ollama
          │
          ▼
      villebot
     Qwen 2.5 7B
```

Frontend ei kommunikoi suoraan Ollaman kanssa.

AI-pyynnöt kulkevat seuraavasti:

1. Selain lähettää viestin osoitteeseen `/api/chat`.
2. Azure Static Web Apps välittää pyynnön Azure Functionille.
3. Azure Function lähettää pyynnön API-avaimella Ollama-proxylle.
4. Tailscale Funnel välittää HTTPS-liikenteen Windows-koneelle.
5. Ollama Proxy tarkistaa API-avaimen ja välittää pyynnön paikalliselle Ollamalle.
6. Ollama suorittaa pyynnön `villebot`-mallilla.
7. Vastaus palautetaan samaa reittiä takaisin selaimelle.

## AI-malli

Projektissa käytetään Ollaman kautta ajettavaa omaa `villebot`-mallia.

Mallin pohjana on:

```text
Qwen 2.5 7B
```

`villebot` sisältää projektikohtaisen system promptin, jonka avulla mallin tarkoitus on vastata Ville Kortesalmen CV:hen ja osaamiseen liittyviin kysymyksiin luonnollisella suomen kielellä.

## AI-palvelun status

Frontend tarkistaa AI-palvelun tilan `/api/status`-endpointin kautta.

Käyttäjälle näytetään:

```text
🟢 AI-palvelu käytettävissä – villebot
```

tai:

```text
🔴 AI-palvelu ei ole tällä hetkellä käytettävissä
```

Status perustuu Ollama-proxyn `/health`-endpointtiin.

Health endpoint tarkistaa:

* että Ollama vastaa
* että `villebot`-malli on saatavilla

## Tietoturva

Ollamaa ei julkaista suoraan internetiin.

Paikallinen Ollama käyttää osoitetta:

```text
127.0.0.1:11434
```

Internetistä tuleva liikenne kulkee Ollama Proxyn kautta.

Proxy käyttää API-avainta sekä `/chat`- että `/health`-endpointin suojaamiseen.

Azure Functionin käyttämä API-avain säilytetään Azure Static Web Appsin ympäristömuuttujissa eikä frontendissä.

Paikalliset Azure Function -asetukset sijaitsevat tiedostossa:

```text
api/local.settings.json
```

Tämä tiedosto on `.gitignore`-tiedostossa eikä sitä tallenneta Git-repositorioon.

## Paikallinen kehitys

### Esivaatimukset

Koneella tarvitaan:

* Node.js
* Azure Functions Core Tools
* Azure Static Web Apps CLI
* Ollama
* Tailscale

Ollaman tulee sisältää `villebot`-malli.

### AI-palvelun käynnistys

Projektissa on yhden klikkauksen käynnistystiedosto:

```text
Käynnistä-AI.cmd
```

Se:

1. tarkistaa Ollaman
2. käynnistää Ollama Proxyn
3. käynnistää Tailscale Funnelin

### AI-palvelun sammutus

```text
Sammuta-AI.cmd
```

Sammutus:

1. sulkee Tailscale Funnelin
2. sulkee Ollama Proxyn

Ollama jätetään käyntiin.

### Azure Functions

```powershell
Set-Location .\api; func start --javascript
```

### Static Web Apps paikallisesti

```powershell
swa start . --api-location http://localhost:7071
```

## Projektin rakenne

```text
ville-cv-ai/
│
├── api/
│   ├── chat/
│   │   ├── function.json
│   │   └── index.js
│   │
│   ├── status/
│   │   ├── function.json
│   │   └── index.js
│   │
│   └── local.settings.json
│
├── assets/
│   └── js/
│       └── chat.js
│
├── ollama-proxy/
│   ├── package.json
│   └── server.js
│
├── Käynnistä-AI.cmd
├── Sammuta-AI.cmd
├── chatbot.js
├── index.html
├── ai-chat.html
├── style.css
├── README.md
└── .gitignore
```

`api/local.settings.json` on paikallinen asetustiedosto eikä kuulu Git-repositorioon.

## CI/CD

GitHub Actions hoitaa Azure Static Web Apps -deployn.

Tuotantoon käytettävä branch:

```text
production-local-ai
```

Kun branchille pusketaan uusi commit, GitHub Actions käynnistää automaattisen Azure-deployn.

## Tuotantoympäristö

Frontend:

```text
Azure Static Web Apps
```

Backend:

```text
Azure Functions
```

AI:

```text
Ollama
```

Model:

```text
villebot
```

Network tunnel:

```text
Tailscale Funnel
```

## Jatkokehitys

Mahdollisia seuraavia kehityskohteita:

* CV-tietojen RAG-haku
* keskusteluhistorian hallinta
* parempi chat-käyttöliittymä
* typing-indikaattori
* streaming-vastaukset
* AI:n vastausten kontekstin parantaminen
* automaattiset testit
* health monitoring
* proxy-tason rate limiting

## Tavoite

Projektin tavoitteena on yhdistää henkilökohtainen CV, moderni web-kehitys, Azure-pilvipalvelut ja paikallinen generatiivinen tekoäly yhdeksi toimivaksi kokonaisuudeksi.

Projektissa AI-inferenssi tapahtuu omalla tietokoneella Ollaman avulla, kun taas verkkosivusto ja API-rajapinta ovat Azureen deployattuna.
