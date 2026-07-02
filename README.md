# CLICOLAB-APP-CURRENCY

Samodzielna, niezalezna aplikacja (osobne repozytorium, osobny host, osobny
silnik Docker) udostepniajaca REST API z kursami USD i EUR na podstawie
publicznego API Narodowego Banku Polskiego (NBP).

Aplikacja nie jest czescia docker-compose CLICOLAB-DEMO-BANK-APP - dziala
w pelni niezaleznie na wlasnym serwerze (np. 10.15.0.11) i jest wywolywana
przez sieciowe zapytania HTTP z innych aplikacji (np. glownej aplikacji
bankowej).

## Endpointy API

| Metoda | Sciezka           | Opis                                            |
|--------|--------------------|--------------------------------------------------|
| GET    | /health            | Health-check aplikacji                          |
| GET    | /api/rates/current | Aktualny kurs sredni USD i EUR (NBP tabela A)   |
| GET    | /api/rates/history | Kursy USD/EUR z ostatnich 7 dni roboczych       |

Przykladowa odpowiedz `/api/rates/current`:

```json
{
  "date": "2026-07-02",
  "usd": { "code": "USD", "rate": 4.0123, "no": "126/A/NBP/2026" },
  "eur": { "code": "EUR", "rate": 4.3512, "no": "126/A/NBP/2026" }
}
```

## Stos technologiczny

- Node.js + Express - serwer API
- Redis - cache odpowiedzi z NBP (domyslnie 30 minut)
- Docker + docker-compose - wlasna, w pelni niezalezna orkiestracja

## Uruchomienie na serwerze (np. 10.15.0.11)

```bash
git clone https://github.com/czarmi/clicolab-app-currency.git
cd clicolab-app-currency
cp .env.example .env
# W .env ustaw ALLOWED_ORIGIN na adres glownej aplikacji, np.:
# ALLOWED_ORIGIN=http://10.15.0.10
docker compose up -d --build
```

Po starcie API bedzie dostepne pod:

```
http://10.15.0.11:4100/api/rates/current
http://10.15.0.11:4100/api/rates/history
```

## Integracja z CLICOLAB-DEMO-BANK-APP

Aplikacja glowna (na innym serwerze / w innym docker-compose) laczy sie
z ta aplikacja wylacznie po sieci, np. poprzez wpis w swoim nginx:

```nginx
upstream currency_api_upstream {
    server 10.15.0.11:4100;
}

location /api/currency/ {
    proxy_pass http://currency_api_upstream/api/rates/;
    proxy_set_header Host $host;
}
```

Zaden kod tej aplikacji nie zmienia sie przy takiej integracji - to w pelni
oddzielny serwis, zgodnie z architektura mikroserwisowa calego projektu.

## Bezpieczenstwo (do rozwazenia w kolejnym kroku)

- Ograniczenie dostepu firewallem tylko z adresu IP glownej aplikacji
- Dodanie klucza API (naglowek X-API-Key) do autoryzacji wywolan
- HTTPS / reverse proxy TLS przed API (np. nginx + certyfikat)
