# Master

Repozitorijum projekta izrađenog u okviru master rada na temu _Orkestracija reaktivnih mikroservisa na Kubernetes platformi_ na Elektronskom fakultetu u Nišu.
Projekat je skup mikroservisa razvijenih u Moleculer okviru koji čine sistem za praćenje vozila i omogućavaju kreiranje novih vožnji.

## Neophodni alati za razvoj

Za lokalno pokretanje projekta je potrebno imati instaliran Docker i Node.js minimalne verzije 12.

## NPM skripte

- `yarn dc:up`: Pokretanje svih mikroservisa, baza podataka i NATS servera korišćenjem Docker Compose
- `yarn dc:down`: Zaustavljanje prethodno pokrenutih komponenti putem Docker Compose

## Testiranje opterećenja

U folderu `scenarios` se nalaze Artillery skripte za testiranje opterećenja.
Kako bi ove skripte mogle da se pokrenu, potrebno je imati Artillery instaliran, što je moguće uraditi pokretanjem `yarn` komande iz root foldera.
Ovim putem će biti instaliran i plugin za Artillery koji šalje StatsD metrike prilikom izvršenja Artillery skripte, koje se mogu prikazati u Grafani.

### Kubernetes klaster na Google Cloud Platformi (GCP)

Pre izvršenja testiranja opterećenja, potrebno je pokrenuti projekat na Kubernetes klasteru željene veličine i izmeniti opciju `target` u svim Artillery skriptama da ukazuju na IP adresu klastera.
Ukoliko se projekat pokreće na GKE-u, skripta `build_and_deploy.sh` će pokrenuti klater od 4 čvora tipa N1-Standard-2 i pokrenuti sve neophodne Helm karte i Kubernetes resurse.
Prilikom pokretanja ove skripte je potrebno zadati ID GCP projekta i ime klastera.

### Grafički prikaz testiranja opterećenja

Za grafički prikaz rezultata neophodno je imati lokalno pokrenutu instancu Grafane.
Potrebno je uvesti dashboard koji se nalazi u fajlu `foober-dashboard.json`.

Nakon toga, potrebno je lokalno proslediti port Prometheus poda: `kubectl port-forward $PROMETHEUS_METRICS_POD_NAME 9090`.

Ukoliko je potrebno prikazati i StatsD metrike dobijene za izvršenje Artillery skripti, potrebno je pokrenuti i Graphite Docker sliku:
```sh
docker run -d\
 -p 80:80\
 -p 2003-2004:2003-2004\
 -p 2023-2024:2023-2024\
 -p 8125:8125/udp\
 -p 8126:8126\
 graphiteapp/graphite-statsd
```

### Testiranje opterećenja

Pre prvog pokretanja, neophodno je prvo izvršiti `artillery run scenarios/create-vehicles.yml` Artillery skriptu koja kreira 200 vozila na osnovu `scenarios/vehicles.csv` fajla.

Nakon što se ova skripta izvrši, moguće je pristupiti testiranju.
Skripta `scenarios/run.js` pokreće tri Artillery skripte (admin, messages i rides), sa razmakom od 10 i 20 sekundi između prve dve i druge dve skripte.
Ova skripta očekuje ime foldera u kome će čuvati izveštaje o pokretanju.

Sada preostaje da se sačeka sa izvršenjem.
Ukoliko je neophodne neke parametre autoskalera promeniti, to treba učiniti i ponovo pokrenuti testiranje, nakon što su ti parametri primenjeni putem kubectl komande.
