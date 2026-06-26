# Datenschutzerklärung

**Stand: Juni 2026**

Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Nachfolgend informieren wir Sie ausführlich darüber, welche Daten bei der Nutzung unserer Website erhoben und wie diese verarbeitet werden.

---

### 1. Verantwortlicher für die Datenverarbeitung

Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und anderer nationaler Datenschutzgesetze ist:

**Buff Interactive - Felix Kinze & Leon Trepesch GbR**  
Eulitzstr. 1  
09112 Chemnitz  
Deutschland  

**Vertreten durch die Gesellschafter:**  
Felix Kinze & Leon Trepesch  

**Kontakt:**  
E-Mail: service@buffinteractive.net  

---

### 2. Bereitstellung der Website, Logfiles und Hosting

#### a) Erstellung von Logfiles
Bei jedem Aufruf unserer Website erfasst unser System automatisiert Daten und Informationen vom Computersystem des aufrufenden Rechners. Folgende Daten werden hierbei erhoben:

* Informationen über den Browsertyp und die verwendete Version
* Das Betriebssystem des Nutzers
* Den Internet-Service-Provider des Nutzers
* Die IP-Adresse des Nutzers
* Datum und Uhrzeit des Zugriffs
* Websites, von denen das System des Nutzers auf unsere Internetseite gelangt (Referrer)
* Websites, die vom System des Nutzers über unsere Website aufgerufen werden

Die Verarbeitung dieser Daten ist technisch erforderlich, um Ihnen unsere Website anzuzeigen sowie die Stabilität und Sicherheit zu gewährleisten. 

* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Gewährleistung der Systemsicherheit, Stabilität und Funktionsfähigkeit der Website).
* **Datenlöschung:** Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind. Im Falle der Erfassung der Daten zur Bereitstellung der Website ist dies der Fall, wenn die jeweilige Sitzung beendet ist. Logfiles werden in der Regel nach spätestens 7 Tagen gelöscht oder anonymisiert.

#### b) Webhosting (netcup & Hetzner)
Wir hosten unsere Website und die zugehörigen Datenbanken bei folgenden Anbietern:
1. **netcup GmbH**, Emmy-Noether-Straße 10, 76131 Karlsruhe, Deutschland (Webserver und primäre Infrastruktur).
2. **Hetzner Online GmbH**, Industriestr. 25, 91710 Gunzenhausen, Deutschland (Ergänzende Server-Infrastruktur und Backups).

Die Container-Orchestrierung und das Deployment-Management erfolgen über die selbstgehostete Plattform **Coolify**, die auf Servern beider vorgenannter Anbieter in Deutschland betrieben wird. Coolify verarbeitet dabei ausschließlich Infrastruktur- und Konfigurationsdaten (z. B. Deploy-Logs, Container-Statusinformationen) und hat keinen Zugriff auf Inhaltsdaten der Nutzer.

Die Hoster verarbeiten in unserem Auftrag die über die Website erhobenen Daten (z. B. Logfiles, Datenbankeinträge, Vertragsdaten).
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren, schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen Anbieter).
* **Auftragsverarbeitung:** Wir haben mit beiden Hostern jeweils einen Vertrag über die Auftragsverarbeitung (AVV) gemäß Art. 28 DSGVO geschlossen. Die Daten werden ausschließlich auf deutschen Servern in ISO-zertifizierten Rechenzentren verarbeitet.

#### c) Content Delivery Network & Sicherheit (Cloudflare)
Wir nutzen zur Absicherung unserer Website gegen Cyberangriffe (z. B. DDoS-Attacken) und zur Beschleunigung der Ladezeiten das Content Delivery Network (CDN) der **Cloudflare Germany GmbH**, Rosheimer Straße 143C, 81671 München, Deutschland (Muttergesellschaft: Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA).

Der gesamte Datenverkehr zwischen Ihrem Browser und unserer Website wird über die Infrastruktur von Cloudflare geleitet. Cloudflare analysiert diesen Datenverkehr automatisiert, um Angriffe abzuwehren und Ladezeiten zu optimieren. Hierbei wird auch Ihre IP-Adresse verarbeitet.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Abwehr schädlicher Zugriffe, Gewährleistung der Betriebssicherheit und Optimierung unserer Ladezeiten).
* **Auftragsverarbeitung & Drittstaatstransfer:** Wir haben mit Cloudflare einen Vertrag über die Auftragsverarbeitung (AVV) auf Basis der EU-Standardvertragsklauseln abgeschlossen. Cloudflare, Inc. (USA) ist zudem unter dem EU-US Data Privacy Framework zertifiziert, was ein angemessenes Datenschutzniveau für eventuelle Datenübermittlungen in die USA gewährleistet.

---

### 3. Cookies, Sitzungsverwaltung und Web-Analyse

#### a) Technisch notwendige Cookies
Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die vom Browser auf Ihrem Endgerät gespeichert werden. Wir setzen ausschließlich **technisch notwendige Cookies** ein, die für den Betrieb der Website unerlässlich sind. Tracking-Cookies oder Cookies von Drittanbietern zu Werbezwecken werden nicht verwendet.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der nutzerfreundlichen Gestaltung und der technischen Bereitstellung der Kernfunktionen unserer Website). Technisch notwendige Cookies bedürfen gemäß der Orientierungshilfe der Datenschutzkonferenz (DSK) zu Cookies und Tracking keiner vorherigen Einwilligung.
* Wir führen **kein Tracking** und keine Webanalyse mittels Cookies von Drittanbietern durch.

#### b) Session-Cookie (Authentifizierung via Better Auth)
Für die Verwaltung von Nutzersitzungen nach dem Login in den Kundenbereich setzen wir einen technisch notwendigen Sitzungs-Cookie ein, der durch das Authentifizierungssystem **Better Auth** gesetzt wird.

| Eigenschaft | Wert |
|---|---|
| Zweck | Authentifizierung und Sitzungsverwaltung im Kundenbereich |
| Maximale Speicherdauer | 7 Tage |
| Typ | HttpOnly, Secure (nicht per JavaScript auslesbar) |
| Drittanbieter | Nein – vollständig selbst gehostet auf deutschen Servern |

Der Cookie wird bei aktiver Abmeldung sofort gelöscht. Eine Nutzung für Tracking oder Werbezwecke findet nicht statt.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des Kundenbereichs) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren Sitzungsverwaltung).

#### c) Selbstgehostete Web-Analyse (OpenPanel)
Zur datenschutzkonformen Reichweitenmessung und Optimierung unserer Website setzen wir eine selbstgehostete Instanz des Analysetools **OpenPanel** ein. Das Analyse-Skript wird von unserem eigenen Server unter dem Endpunkt `analytics.buffinteractive.net` ausgeliefert und läuft ausschließlich auf eigener Infrastruktur bei netcup/Hetzner in Deutschland. Es findet **keine Datenübermittlung an Dritte** statt.

Gemäß der Orientierungshilfe der Datenschutzkonferenz (DSK) zu Cookies und Tracking (aktualisierte Fassung) ist für Analysewerkzeuge, die cookielos betrieben werden und bei denen die IP-Adresse vor jeder weiteren Verarbeitung pseudonymisiert oder anonymisiert wird, eine vorherige Einwilligung nicht zwingend erforderlich, sofern die Verarbeitung ausschließlich zu statistischen Zwecken erfolgt und kein personenbezogenes Nutzerprofil erstellt wird. Unser Einsatz von OpenPanel entspricht diesen Anforderungen:
* **Keine Cookies:** OpenPanel setzt keinerlei Cookies oder andere persistente Kenner auf Ihrem Endgerät.
* **IP-Anonymisierung:** Die IP-Adresse wird unmittelbar bei der Erfassung serverseitig gekürzt und anonymisiert. Eine Re-Identifizierung oder Zusammenführung mit anderen Datenquellen ist technisch ausgeschlossen.
* **Kein Fingerprinting:** Es werden keine Browser-Fingerprints oder gerätebezogenen Kenner erstellt.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der statistischen Analyse des Besucherverhaltens zur Optimierung unseres Webangebots). Ihnen steht ein jederzeitiges Widerspruchsrecht gegen diese Verarbeitung zu (vgl. Abschnitt 6).

---

### 4. Kontaktformular, E-Mail-Kontakt und Benachrichtigungen

#### a) Kontaktaufnahme
Auf unserer Website sind Kontaktmöglichkeiten vorhanden (z. B. Formulare und E-Mail-Links), die für die elektronische Kontaktaufnahme genutzt werden können. Nimmt ein Nutzer diese Möglichkeit wahr, so werden die in der Eingabemaske eingegebenen Daten an uns übermittelt und gespeichert:
* Name
* E-Mail-Adresse
* Unternehmen / Firma
* Inhalt der Anfrage (z. B. Art der technischen Herausforderung oder des Engpasses)
* Angegebener Umsatz (MRR) bzw. Budgetrahmen (falls zutreffend)

Alternativ ist eine Kontaktaufnahme über die bereitgestellte E-Mail-Adresse möglich. In diesem Fall werden die mit der E-Mail übermittelten personenbezogenen Daten des Nutzers gespeichert.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (sofern die Kontaktaufnahme der Anbahnung, dem Abschluss oder der Durchführung eines Vertrages dient) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen).
* **Datenlöschung:** Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind. Für die personenbezogenen Daten aus der Eingabemaske des Kontaktformulars und diejenigen, die per E-Mail übersandt wurden, ist dies dann der Fall, wenn die jeweilige Konversation mit dem Nutzer beendet ist und keine gesetzlichen (z. B. steuerlichen oder handelsrechtlichen) Aufbewahrungspflichten entgegenstehen.

#### b) E-Mail-Versand über Resend
Für die zuverlässige Zustellung von automatisierten System-E-Mails (wie z. B. Vertragsbestätigungen, PDFs und Benachrichtigungen) nutzen wir den Dienst **Resend** der Resend Labs, Inc., 311 W 43rd St, New York, NY 10036, USA.
Hierbei werden Ihr Name, Ihre E-Mail-Adresse sowie die Inhalte der E-Mail (einschließlich angehängter Vertragsentwürfe oder Bestellbestätigungen) an Resend übermittelt.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und schnellen Zustellung unserer System-E-Mails).
* **Auftragsverarbeitung & Drittstaatstransfer:** Wir haben mit Resend einen Vertrag über die Auftragsverarbeitung (AVV) abgeschlossen. Für die Übermittlung von Daten in die USA wurden die EU-Standardvertragsklauseln vereinbart, um ein angemessenes Datenschutzniveau sicherzustellen.

---

### 5. Registrierung, Kundenkonto und Vertragsabwicklung

Soweit Sie sich auf unserer Plattform registrieren, ein Kundenkonto anlegen oder Bestellungen über unsere Bestellformulare (WaaS-Tarife) aufgeben, verarbeiten wir die dafür erforderlichen Daten zur Vertragserfüllung und Kundenbetreuung:

#### a) Vertrags- und Rechnungsdaten
* Registrierungsdaten (E-Mail-Adresse, Passwort-Hash, Name)
* Vertragsdaten (Tarifwahl, Startdatum, Rechnungsadresse, Firmenname, Rechtsform, Ansprechpartner, Telefonnummer, USt-ID)
* Zahlungsdaten (SEPA-Lastschriftmandat, Bankverbindung: IBAN, BIC, Bank, Kontoinhaber, Unterschrift des Mandats)

Die Verarbeitung erfolgt zur Bereitstellung Ihres Benutzerkontos, zur Erstellung von Vertragsunterlagen und zur Durchführung der gebuchten Dienstleistungen.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung oder Durchführung vorvertraglicher Maßnahmen).
* **Datenlöschung:** Wir speichern diese Daten für die Dauer der Vertragslaufzeit sowie darüber hinaus gemäß den gesetzlichen Aufbewahrungsfristen (in der Regel 10 Jahre für steuerlich und handelsrechtlich relevante Buchungs- und Vertragsunterlagen nach § 147 AO und § 257 HGB).

#### b) Sitzungsdaten (Redis In-Memory-Speicher)
Zur performanten Verwaltung von Nutzersitzungen im Kundenkonto setzen wir einen selbstgehosteten **Redis**-In-Memory-Datenspeicher ein. Redis speichert ausschließlich Sitzungs-Tokens und zugehörige Metadaten (Sitzungs-ID, Ablaufzeitpunkt, Nutzer-ID) und ist nicht öffentlich erreichbar. Redis läuft auf eigener Infrastruktur bei netcup/Hetzner in Deutschland.
* Sitzungsdaten werden nach spätestens **7 Tagen** automatisch invalidiert und gelöscht.
* Bei aktiver Abmeldung werden die Sitzungsdaten unverzüglich aus dem Speicher entfernt.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Bereitstellung des Kundenkontos) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und performanten Sitzungsverwaltung).

#### c) Digitaler Unterschriftsprozess & Audit-Trail Telemetrie
Wenn Sie Verträge (z. B. WaaS-Bestellungen) digital über unsere Website abschließen, erfassen wir zur rechtssicheren Dokumentation des Vertragsabschlusses und zur Betrugsprävention zusätzliche Telemetriedaten des Unterzeichnungsvorgangs:
* Die gezeichnete Unterschrift (als Grafikdatei/Base64)
* Die IP-Adresse des unterzeichnenden Geräts zum Zeitpunkt der Zeichnung
* Den User-Agent des verwendeten Browsers (Browsertyp, Version, Betriebssystem)
* Den genauen Zeitstempel des Unterschriftsvorgangs

Diese Daten werden zusammen mit dem fertigen Vertragsdokument (PDF) im System hinterlegt und im Audit-Trail des PDF-Dokuments dokumentiert.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung und Dokumentation des Abschlusses) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Nachweisbarkeit der rechtsverbindlichen Willenserklärung der Vertragsparteien sowie der Abwehr von Identitätsdiebstahl und Betrug).

#### d) Zahlungsabwicklung (Stripe & Lemon Squeezy)
Für die Abrechnung unserer Dienstleistungen und Softwarelösungen nutzen wir die Dienste spezialisierter Zahlungsanbieter:
1. **Stripe Payments Europe, Ltd.**, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland (Muttergesellschaft: Stripe, Inc., 354 Oyster Point Blvd, South San Francisco, CA 94080, USA). Stripe verarbeitet Rechnungsdaten und SEPA-/Kreditkartenzahlungen zur direkten Invoicing-Abwicklung.
2. **Lemon Squeezy, LLC**, 222 Main Street, Suite 500, Salt Lake City, UT 84101, USA (seit Juli 2024 Teil der Stripe-Unternehmensgruppe, weiterhin als eigenständige Plattform betrieben). Lemon Squeezy fungiert als unser „Merchant of Record“ (Wiederverkäufer) für die Lizenzierung und Abrechnung bestimmter SaaS-Tarife und tritt dabei als eigenständiger Vertragspartner Ihrer Kunden auf.

Die Anbieter erfassen hierbei Ihre Zahlungsdaten (z. B. Bankverbindung, Kreditkartendaten, Betrag) sowie Kontaktdaten zur Durchführung der Transaktionen.
* **Rechtsgrundlage:** Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
* **Drittstaatstransfer:** Sowohl Stripe, Inc. als auch Lemon Squeezy, LLC sind unter dem EU-US Data Privacy Framework zertifiziert, bzw. es wurden Standardvertragsklauseln vereinbart, um ein den EU-Standards entsprechendes Datenschutzniveau bei einer eventuellen Verarbeitung in den USA zu sichern.

---

### 6. Ihre Rechte als betroffene Person

Werden personenbezogene Daten von Ihnen verarbeitet, sind Sie Betroffener im Sinne der DSGVO und es stehen Ihnen folgende Rechte gegenüber uns als Verantwortlichem zu:

* **Recht auf Auskunft (Art. 15 DSGVO):** Sie können Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten verlangen.
* **Recht auf Berichtigung (Art. 16 DSGVO):** Sie können die unverzügliche Berichtigung unrichtiger oder Vervollständigung Ihrer bei uns gespeicherten personenbezogenen Daten verlangen.
* **Recht auf Löschung (Art. 17 DSGVO):** Sie können die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten verlangen, sofern keine Ausnahmen (wie gesetzliche Aufbewahrungspflichten) greifen.
* **Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO):** Sie können die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten unter bestimmten Voraussetzungen verlangen.
* **Recht auf Datenübertragbarkeit (Art. 20 DSGVO):** Sie haben das Recht, Ihre Daten in einem strukturierten, gängigen und maschinenlesbaren Format zu erhalten oder an einen anderen Verantwortlichen übertragen zu lassen.
* **Widerspruchsrecht (Art. 21 DSGVO):** Sie haben das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit gegen die Verarbeitung Sie betreffender personenbezogener Daten, die aufgrund von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, Widerspruch einzulegen.
* **Recht auf Widerruf der datenschutzrechtlichen Einwilligungserklärung (Art. 7 Abs. 3 DSGVO):** Sie können eine einmal erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt davon unberührt.
* **Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO):** Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren. Die für uns zuständige Aufsichtsbehörde ist der **Sächsische Datenschutz- und Transparenzbeauftragte (SDTB)**, Devrientstraße 5, 01067 Dresden (https://www.datenschutz.sachsen.de). Sie können sich jedoch auch an die Aufsichtsbehörde Ihres gewöhnlichen Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes wenden.

---

### 7. Datensicherheit

Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. Sie erkennen eine verschlüsselte Verbindung an dem Schloss-Symbol in der Adresszeile Ihres Browsers und an der Kennzeichnung `https://`.

Zudem bedienen wir uns angemessener technischer und organisatorischer Sicherheitsmaßnahmen (TOM) gemäß Art. 32 DSGVO, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, teilweisen oder vollständigen Verlust, Zerstörung oder gegen den unbefugten Zugriff Dritter zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert.
