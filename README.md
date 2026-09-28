# 🔮 Gwiezdny Przewodnik

![Deploy](https://img.shields.io/badge/deploy-netlify-00C7B7?logo=netlify&logoColor=white)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-lightgrey)
![Stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-d4af37)

**🔗 Live: [gwiezdnyprzewodnik.pl](https://gwiezdnyprzewodnik.pl)** · 📱 [Aplikacja na Google Play](https://play.google.com/store/apps/details?id=com.Pokekage.gwiezdnyprzewodnik)

Polska platforma astrologiczna: horoskop dzienny, tarot dnia, fazy Księżyca, zgodność znaków, sennik, kamienie i minerały, dziennik kosmiczny oraz artykuły o astrologii. Własny projekt (nie zlecenie) — od pomysłu, przez frontend, backend serverless, integrację AI, po monetyzację i zgodność z RODO.

## O projekcie

Cel: darmowe, przyjemne wizualnie narzędzie astrologiczne, które samo się utrzymuje z reklam, bez konieczności płatnego backendu czy bazy danych. Stąd wybór: statyczny frontend + Netlify Functions jako lekki serverless proxy tam, gdzie trzeba ukryć klucz API.

## Funkcje

- **Horoskop dzienny** dla 12 znaków zodiaku, generowany przez AI
- **Znaki zodiaku** — strona zbiorcza i 12 statycznych stron znaków (charakter, miłość, praca, zgodność, kamienie, FAQ), czytelnych dla wyszukiwarek bez JavaScriptu
- **Tarot dnia** — losowana karta z interpretacją
- **Kalkulator faz Księżyca** — na dowolną datę, w tym lunację urodzin
- **Zgodność znaków** — kalkulator kompatybilności dwóch znaków
- **Sennik** — interpretacja snów przez AI
- **Kamienie i minerały** przypisane do znaków zodiaku
- **Księga smaków** — przepisy kulinarne pod znak zodiaku
- **Dziennik kosmiczny** — prywatne notatki użytkownika (zapis wyłącznie lokalnie, `localStorage`, bez wysyłania na serwer)
- **Generator artykułów AI** o astrologii/ezoteryce — osobna strona `artykuly-ai.html`, bez reklam i z `noindex`, oddzielona od treści redakcyjnych

## Integracja AI

Treści generowane na żywo (horoskop, sennik, artykuły) idą przez `netlify/functions/groq.js` — funkcję serverless, która przekazuje zapytanie do [Groq API](https://groq.com/) (model `llama-3.3-70b-versatile`). Klucz API jest tylko w zmiennej środowiskowej Netlify i nigdy nie trafia do przeglądarki.

Proxy jest zabezpieczone przed nadużyciem: blokuje wywołania z obcych domen (nagłówek `Origin`), dopuszcza tylko wybrane modele, przycina `max_tokens` i odrzuca zbyt długie zapytania. Dodatkowe dozwolone adresy (np. podgląd na `*.netlify.app`) ustawia się zmienną `EXTRA_ALLOWED_ORIGINS`.

## Reklamy i zgodność z RODO

- Google AdSense (`ca-pub-6047762879323596`), jednostki reklamowe rozmieszczone na wszystkich stronach z treścią (patrz `ads.txt`).
- **Zgoda na cookies przez certyfikowany CMP Google (IAB TCF v2)** — komunikat „Przepisy europejskie” konfigurowany w AdSense (Prywatność i wiadomości), wymagany przez Google od 2024 r. dla ruchu z EOG, UK i Szwajcarii. Tag AdSense sam wstrzymuje personalizację do decyzji użytkownika — bez własnego kodu zgody.
- Reklamy tylko na ekranach z treścią — bez jednostek na stronie kontaktu, polityce prywatności i w dzienniku (zgodnie z zasadami Google Publisher Policies).
- Polityka prywatności i regulamin opisują podstawę prawną (RODO), zakres danych i rolę Google AdSense/Analytics jako podmiotów trzecich.

## Struktura projektu

```
├── index.html                    # Horoskop dzienny (strona główna)
├── znaki-zodiaku.html            # Strona zbiorcza znaków zodiaku
├── znak-*.html                   # 12 stron znaków (baran, byk, … ryby)
├── artykuly-ai.html              # Generator artykułów AI (noindex, bez reklam)
├── tarot-dnia.html                # Karta tarota dnia
├── fazy-ksiezyca.html             # Kalkulator faz Księżyca
├── zgodnosc-znakow.html           # Kalkulator zgodności znaków
├── sennik.html                    # Sennik / interpretacja snów
├── kamienie-mineraly.html         # Kamienie i minerały dla znaków zodiaku
├── dziennik-kosmiczny.html        # Dziennik (zapisy lokalnie w przeglądarce)
├── ksiega-smakow.html             # Przepisy kulinarne pod znaki zodiaku
├── wiedza-astrologiczna.html      # Artykuły o astrologii
├── o-nas.html / kontakt.html      # Strony informacyjne
├── polityka-prywatnosci.html      # Polityka prywatności (RODO + AdSense)
├── regulamin.html                 # Regulamin serwisu
├── style.css                      # Style całej witryny
├── script.js                      # Logika interfejsu i obliczeń
├── ads.txt                        # Autoryzacja sprzedawców reklam (Google AdSense)
├── sitemap.xml                    # Mapa strony dla robotów wyszukiwarek
├── robots.txt                     # Reguły indeksowania (wskazuje na sitemap.xml)
├── netlify.toml                   # Konfiguracja przekierowań Netlify (/api/* → functions)
└── netlify/functions/groq.js      # Funkcja serverless (Netlify Functions, API Groq)
```

## Uruchomienie lokalnie

Strona jest w pełni statyczna, więc wystarczy dowolny serwer plików, np.:

```bash
npx serve .
```

albo w VS Code rozszerzenie **Live Server** → *Go Live*.

Jeśli chcesz przetestować funkcję serverless (`netlify/functions/groq.js`), użyj Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

## Reklamy (Google AdSense)

- Klient AdSense: `ca-pub-6047762879323596` (patrz `ads.txt` i tagi `<ins class="adsbygoogle">` na poszczególnych stronach).
- Zgoda użytkowników z EOG/UK/Szwajcarii: komunikat „Przepisy europejskie” w AdSense → Prywatność i wiadomości (certyfikowany CMP Google, IAB TCF). Komunikat jest dostarczany przez ten sam tag `adsbygoogle.js` — w kodzie strony nie ma osobnego skryptu zgody.
- Nowe jednostki reklamowe dodajemy standardowo: `<ins class="adsbygoogle">...</ins>` + `<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`.
- Nie wstawiamy reklam na strony bez treści wydawcy (kontakt, polityka prywatności, regulamin, dziennik) ani na stronę z treściami generowanymi automatycznie (`artykuly-ai.html`).

## Deploy

Repozytorium jest podpięte pod Netlify — push do gałęzi głównej wdraża zmiany automatycznie. Ręczny deploy: `netlify deploy --prod`.

## Licencja

Zobacz [LICENSE](./LICENSE) — wszystkie prawa zastrzeżone.

## Autor

**[LinkedIn](https://www.linkedin.com/in/dj99/)**
