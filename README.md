# DATA-AI-Hackathon-Track-2
Health &amp; Environment Challenge for the Data&amp;AI Hackathon , 30-31 March, University of Leeds
# Hackathon Data Guide: Global Energy & Emissions

## What's in this folder?

We've downloaded and organised **386 CSV files** from the U.S. Energy Information Administration (EIA) international energy dataset, covering **231 countries from 1980 to 2023**.

All files are in **wide format** (countries as rows, years as columns) — open any CSV in Excel or Numbers and it's immediately readable.

Browse `README.csv` for a full index of every file with its description, units, and row count.

### Folder structure

| Folder | Files | What's inside |
|--------|------:|---------------|
| `petroleum-and-other-liquids/` | 91 | Crude oil, refined products, motor gasoline, jet fuel, LPG — production, consumption, imports, exports |
| `coal-and-coke/` | 146 | Coal (anthracite, bituminous, lignite), metallurgical coke — production, consumption, trade, reserves |
| `electricity/` | 73 | Generation by source (nuclear, hydro, wind, solar, fossil), capacity, imports/exports |
| `natural-gas/` | 31 | Dry/gross production, consumption, trade, reserves, flaring |
| `biofuels/` | 30 | Biofuels, fuel ethanol, biodiesel — production & consumption |
| `total-energy/` | 10 | Primary energy production & consumption totals |
| `energy-intensity/` | 4 | Energy per capita, energy per GDP, population, GDP |
| `co2-emissions/` | 1 | Total CO2 emissions by country |

---

## Data sources

### Primary source (downloaded)
- [EIA International Energy Overview](https://www.eia.gov/international/overview/world)
- [EIA International Rankings](https://www.eia.gov/international/rankings/world?pa=44&u=2&f=A&v=none&y=01%2F01%2F2023)
- [EIA — GDP by Country](https://www.eia.gov/international/data/world/other-statistics/gross-domestic-product-by-country)
- [EIA — Energy Intensity by GDP and Population](https://www.eia.gov/international/data/world/other-statistics/energy-intensity-by-gdp-and-population)
- [EIA — Population by Country](https://www.eia.gov/international/data/world/other-statistics/population-by-country)
- [EIA — Carbon Emissions](https://www.eia.gov/environment/emissions/carbon/)

### Additional sources for cross-referencing & enrichment
- [Global Carbon Budget](https://www.globalcarbonproject.org/carbonbudget/) — annual CO2 budgets from fossil fuels, land use, and ocean/land sinks
- [GCB Interactive Visualisation](https://mdosullivan.github.io/GCB/)
- [Our World in Data — Who has contributed most to global CO2?](https://ourworldindata.org/contributed-most-global-co2)
- [Our World in Data — CO2 adjusted for trade](https://ourworldindata.org/consumption-based-co2)
- [Global Carbon Atlas — Emissions](https://globalcarbonatlas.org/emissions/carbon-emissions/)
- [Global Carbon Atlas — Home](https://globalcarbonatlas.org/)
- [Energy Institute — Statistical Review of World Energy](https://www.energyinst.org/statistical-review)
- [Environmental Footprints — Infographics](https://main.environmentalfootprints.org/infographics)
- [The Guardian — World CO2 Emissions Data](https://www.theguardian.com/news/datablog/2011/jan/31/world-carbon-dioxide-emissions-country-data-co2)

---

## Data challenges

Working with this data, you'll encounter several real-world issues — these are features, not bugs! Tackling them is part of the hackathon.

### 1. Missing values & inconsistent coverage
- Not all countries report data for all years. Many developing nations have gaps, especially before 2000.
- Values appear as `--`, `NA`, or empty cells depending on the series.
- Some countries only exist for part of the timeline (e.g., South Sudan from 2011, USSR until 1991).

### 2. Country changes over time
- The dataset includes historical entities that no longer exist: **USSR**, **Yugoslavia**, **Czechoslovakia**, **East Germany**.
- Successor states have data starting at different points. You'll need to decide how to handle continuity (e.g., does Russia = USSR for pre-1991 comparisons?).

### 3. Aggregation regions vs individual countries
- The data mixes individual countries (e.g., `USA`, `CHN`) with aggregate regions (`AFRC` for Africa, `EU27`, `OECD`, `WORL` for World).
- Be careful not to double-count when summing — Africa + individual African countries = double the real total.

### 4. Multiple units for the same metric
- Many metrics appear in several unit variants (e.g., coal production in metric tons, terajoules, quadrillion Btu, million tonnes of oil equivalent).
- Choose the right unit for your analysis, or be explicit about which you're using.

### 5. Consumption-based vs production-based accounting
- CO2 emissions in this dataset are **production-based** (where fossil fuels are burned), not **consumption-based** (who benefits from the goods produced).
- This matters enormously: China's emissions look very different when you account for goods exported to Europe and the US. See the [Our World in Data trade-adjusted analysis](https://ourworldindata.org/consumption-based-co2).

### 6. Per-capita vs absolute vs intensity
- A country can be a small total emitter but high per-capita (e.g., Qatar, Iceland).
- Energy intensity (energy/GDP) can drop while absolute consumption rises — this is the "decoupling" question.
- Be clear about what your metric actually measures.

### 7. Data recency
- The most recent complete year is typically 2022 or 2023, but some series lag by a year or more.
- Some sources (e.g., The Guardian dataset) are based on **2007-era data** and are significantly out of date.

---

## Existing demo

### Global Energy Intensity Dashboard (`demo1-dashboard/`)

An interactive choropleth map built with Plotly.js showing energy intensity across 231 countries from 1980 to 2023. Features:

- **Two metrics**: Energy per Capita (MMBtu/person) and Energy per GDP (1000 Btu/2015$ GDP PPP)
- **Year slider** with animated playback — watch how global energy intensity has evolved over four decades
- **World map** colour-coded by intensity, with hover details per country
- **Timeline chart** tracking World, USA, China, India, Germany, and Brazil over time
- **Live statistics**: world average, highest, lowest, and country count

To run it: `python3 -m http.server 8080` from the `jimdata/` folder, then open [http://localhost:8080/demo1-dashboard/](http://localhost:8080/demo1-dashboard/)

### Energy Decoupling Analysis (`demo3-decoupling/`)

A scatter-plot analysis that classifies countries by whether their economic growth has **decoupled** from energy consumption. It compares changes in energy-per-capita vs energy-per-GDP over selectable time periods, categorising each country as:

- **Strong decoupling** — GDP intensity dropped sharply while per-capita use held steady
- **Weak decoupling** — GDP intensity improved more than per-capita
- **Recoupling** — GDP intensity worsened
- Includes a ranked table of countries by decoupling score

To run it: same local server, open [http://localhost:8080/demo3-decoupling/](http://localhost:8080/demo3-decoupling/)

---

## Hackathon challenge idea: Update the Carbon Footprint figure

The famous **Carbon Footprint infographic** — widely shared and cited — is based on data from **2007**. The world has changed dramatically since then: China's emissions have doubled, renewables have surged, and several countries have started decoupling growth from emissions.

**The opportunity**: use the data in this folder to build an **updated, interactive version** of that figure using current data (up to 2023). You could:

- Show how country rankings have shifted since 2007
- Add a time dimension (animate the changes from 2007 to 2023)
- Incorporate consumption-based emissions (using Global Carbon Project data) alongside the production-based EIA data
- Highlight which countries have improved and which have worsened
- Make it shareable and embeddable, not just a static image

This is a chance to replace an outdated but influential visualisation with something accurate, current, and interactive.

---

### Before You Arrive

- **Choose your track**:
  - **Track 1**: Healthcare & Digital Pharmacy
  - **Track 2**: Earth, Environment & Climate
- You are welcome to form teams (max 4 people) ahead of the event or on Day 1.
- Bring your laptop and charger (cluster PCs are also available if you prefer).
- Light refreshments and drinks will be provided, but please arrange your own lunch on both days.
- All participants will receive a participation certificate.

---

### Event Timeline

#### Day 1 — Monday 30 March

| Time | Activity |
|------|----------|
| 09:30 | Registration & Welcome |
| 10:00 | Challenge Presentations |
| 10:30 | Group Formation & Start |
| 13:00 | Lunch Break |
| 14:00 | Back to Work |
| 16:30 | Wrap-up & Close for the Day |

#### Day 2 — Tuesday 31 March

| Time | Activity |
|------|----------|
| 10:00 | Start & Updates |
| 13:00 | Submission Deadline & Lunch |
| 14:00 | Team Presentations to the Panel |
| 16:00 | Panel Adjourns |
| 16:30 | Winner Announcement |

**Awards**: Prize for 1st place, award certificates for finalists, participation certificates for all teams.

---

### Day 2 Submission Instructions

**Submission deadline: 13:00 on Tuesday 31 March** (before lunch).

A submission form will be circulated where each team must provide:

1. **Track entered** (Track 1 or Track 2)
2. **Team members** — names and email addresses for all members
3. **GitHub repository link** — the repo **must be public** by the submission deadline

#### What your repo must contain

At a minimum:

- A **README file** with clear instructions on how to run your code to reproduce the output you are presenting. This includes: dependencies, data setup steps, and the command(s) to run.
- Your **code** (notebooks, scripts, or app).
- Any **output files** referenced in your presentation.

#### What we will check

- The repo is public and accessible.
- The README instructions are sufficient to run the code.
- Minimum reproducibility checks will be run to verify the code executes and the output matches what you describe in your presentation.

#### Presentation (14:00–16:00)

- **~5 minutes per team** — keep it focused.
- Walk us through your steps, show your output, and demonstrate your critical thinking.
- The panel will ask brief follow-up questions.
  
---

### Working Hours

Rooms are available until 16:30 daily. Students may continue working afterwards in other 24-hour clusters if they wish, but this is optional — make sure you take breaks and rest.

We look forward to an exciting two days of collaborative problem-solving and innovation!

