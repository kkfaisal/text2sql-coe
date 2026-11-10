// All site content lives here. Edit this file to update the site; no build step needed.
window.COE = {
  challenges: [
    { icon: "🗂️", title: "Too many tables", what: "Hundreds of tables don't fit in a prompt, so the model picks the wrong one.", ex: "orders, orders_v2, fct_orders_daily… which one?" },
    { icon: "🔤", title: "Cryptic names", what: "Column names mean nothing without docs.", ex: "cust_stat_cd = 'A' actually means \"active customer\"" },
    { icon: "📐", title: "House definitions", what: "Metrics follow our own rules the model can't guess.", ex: "\"Revenue\" = net of refunds, no test accounts, by booked date" },
    { icon: "🔗", title: "Tricky joins", what: "Lots of joins look valid; some quietly double count.", ex: "Orders joined to shipments at line level inflates totals" },
    { icon: "🌫️", title: "Vague questions", what: "People skip time ranges, filters and grain.", ex: "\"Top customers last quarter\": fiscal or calendar? By revenue or orders?" },
    { icon: "🗣️", title: "SQL dialects", what: "Every engine has its own functions.", ex: "Date functions differ between Databricks, Snowflake and Postgres" },
    { icon: "🤫", title: "Silent wrong answers", what: "The query runs, returns a number, and the number is wrong.", ex: "The scariest one: no error, and people trust it", danger: true },
    { icon: "🔒", title: "Security", what: "Generated SQL must respect access rules, PII and cost.", ex: "A casual question that scans a 10 TB table or shows masked columns" },
    { icon: "🔄", title: "Things change", what: "Schemas and metrics drift; yesterday's context goes stale.", ex: "A renamed column breaks a bunch of saved examples" }
  ],

  techniques: [
    {
      id: "T1", name: "The baseline: just show it the schema", short: "Baseline", cat: "generation", icon: "🧪",
      folder: "t1_baseline",
      what: "Paste the table definitions and the question into an LLM and ask for SQL. That's it.",
      shines: "You've got a handful of well-named tables, a quick prototype, or power users who can spot mistakes.",
      falls: "Breaks down past roughly 20–50 tables and knows nothing about business meaning.",
      note: "This is our control group: every other repo has to beat it."
    },
    {
      id: "T2", name: "Metadata enrichment", short: "Metadata", cat: "context", icon: "🏷️",
      folder: "t2_metadata_enrichment",
      what: "Give tables and columns real descriptions, sample values, allowed values, keys, join hints and synonyms. An LLM can draft these from data profiling, then the data owners review them (for example as Unity Catalog comments and tags).",
      shines: "Column names are cryptic or a catalog already exists. Usually the cheapest win for the effort.",
      falls: "Only as good as the curation, and it doesn't capture metric logic on its own.",
      badge: "Cheapest win"
    },
    {
      id: "T3", name: "Semantic layer and metric views", short: "Semantic layer", cat: "context", icon: "📊",
      folder: "t3_semantic_layer",
      what: "Define metrics, dimensions and join paths once (dbt Semantic Layer, Cube, LookML, Databricks metric views). The LLM just picks \"revenue by region\"; the layer writes the actual SQL.",
      shines: "KPI and exec reporting, where \"revenue\" has to mean exactly one thing. Highest trust.",
      falls: "It can only answer what's been modeled, so open-ended exploring falls outside it. Needs upfront modeling work.",
      badge: "Highest trust"
    },
    {
      id: "T4", name: "Few-shot SQL examples", short: "Few-shot examples", cat: "context", icon: "📚",
      folder: "t4_fewshot_examples",
      what: "Keep a library of verified question → SQL pairs. When a new question comes in, grab the most similar ones and show them to the model. Great sources: analyst query logs, dashboard queries, hand-picked golden queries.",
      shines: "Questions follow familiar patterns, or house logic is easier to show than explain. Often the single biggest accuracy boost.",
      falls: "The library needs looking after, it's weaker on brand-new kinds of questions, and examples go stale when schemas change.",
      badge: "Biggest boost"
    },
    {
      id: "T5", name: "Schema linking and retrieval", short: "Schema linking", cat: "context", icon: "🧭",
      folder: "t5_schema_linking",
      what: "Before writing SQL, find just the relevant tables and columns: embedding search over metadata, value indexes (so \"California\" maps to state = 'CA'), and walking the join graph.",
      shines: "The warehouse is big, with hundreds or thousands of tables. It's what lets T2 and T4 scale.",
      falls: "If retrieval misses a table, nothing later can fix it, so we measure its recall separately."
    },
    {
      id: "T6", name: "Agents that check their own work", short: "Self-correction", cat: "validation", icon: "🔁",
      folder: "t6_agentic_correction",
      what: "An agent loop: clarify the question, plan, write SQL, do a dry run or EXPLAIN, look at errors or empty results, fix, try again. It can also write a few candidates and vote.",
      shines: "Questions are complex and multi-step, or dialect errors keep popping up, and a few extra seconds are fine.",
      falls: "More LLM calls means more cost and latency, and it's better at fixing syntax errors than wrong logic."
    },
    {
      id: "T7", name: "Fine-tuning a model", short: "Fine-tuning", cat: "generation", icon: "🎯",
      folder: "t7_finetuning",
      what: "Train a smaller open model on our own question → SQL pairs and SQL dialect.",
      shines: "Volume is huge, latency or cost targets are strict, data can't leave our network, and the schema is stable.",
      falls: "Needs thousands of good pairs and retraining when schemas change. Big frontier models with good context often match it."
    },
    {
      id: "T8", name: "Ontologies and knowledge graphs", short: "Ontology", cat: "context", icon: "🕸️",
      folder: "t8_ontology_auto_ontology",
      what: "Model business concepts, how they relate, and how they map to physical tables as a graph. The agent reasons about concepts first, then writes SQL. NVIDIA Auto Ontology is a nice open-source example.",
      shines: "Lots of source systems share overlapping ideas (customer, account, product), questions cross domains, and you really need explainable, certified answers.",
      falls: "It's the newest approach and least proven in production. Certifying takes time from domain experts, and it's one more platform to run.",
      stages: [
        { t: "Your data", d: ["databases (10 engines)", "query history", "existing semantic models"] },
        { t: "1. Generate", d: ["profile columns", "extract business terms", "infer joins", "mine query history"] },
        { t: "2. Certify", d: ["people test it with real questions", "fix terms, then certify"] },
        { t: "3. Answer", d: ["find terms, write SQL", "check and repair", "return SQL + steps", "or say \"can't answer\""] }
      ],
      stagesNote: "Humans certify what the machine drafts, then answers build on it. Runs on Postgres + pgvector and ships with an MCP server, REST API and CLI.",
      badge: "Newest"
    },
    {
      id: "T9", name: "Platform-native assistants", short: "Platform tools", cat: "platform", icon: "🧩",
      folder: "t9_platform_native",
      what: "Managed tools like Databricks Genie and Snowflake Cortex Analyst package T2–T6 behind a nice UI. You configure them with instructions, example SQL and trusted assets.",
      shines: "A team is already on that platform and wants something working fast. Governance comes built in.",
      falls: "Less control and tied to one vendor. And they're still only as good as the metadata and examples we give them, which the CoE builds anyway.",
      badge: "Fastest start"
    }
  ],

  // Decision flow: four questions in order; first "yes" wins.
  wizard: [
    { q: "Must the number match an official KPI?", hint: "e.g. revenue, churn, headcount for execs",
      yes: { stack: ["T3", "T4"], title: "T3 semantic layer", sub: "plus T4 examples for phrasing" } },
    { q: "Do questions span many source systems?", hint: "e.g. \"customer\" lives in CRM, billing, support",
      yes: { stack: ["T8", "T5", "T6"], title: "T8 ontology", sub: "plus T5 linking and T6 repair" } },
    { q: "More than about 50 tables in play?", hint: "tables the question could plausibly touch",
      yes: { stack: ["T5", "T2", "T4"], title: "T5 schema linking first", sub: "then T2 metadata and T4 examples" } },
    { q: "Already on Databricks or Snowflake, and want something working quickly?", hint: "a managed tool gets you there fastest",
      yes: { stack: ["T9", "T2", "T4"], title: "T9 platform tool", sub: "fed with our T2 + T4 assets" } }
  ],
  wizardDefault: { stack: ["T2", "T4", "T6"], title: "T2 metadata + T4 examples", sub: "add T6 self-correction for the harder questions" },

  useCases: [
    { uc: "Exec KPI questions (\"Q3 revenue by region\")", go: ["T3"], add: ["T4"], why: "One official definition; numbers must match dashboards" },
    { uc: "Analyst self-service in one domain", go: ["T2", "T4"], add: ["T6"], why: "Broad questions, known patterns, analysts can spot errors" },
    { uc: "Big warehouse, lots of teams", go: ["T5"], add: ["T2", "T4"], why: "You have to find the right context before you can use it" },
    { uc: "Questions across many source systems", go: ["T8"], add: ["T5", "T6"], why: "Shared concepts and certified mappings across systems" },
    { uc: "Complex multi-step analysis", go: ["T6"], add: ["T4"], why: "Plan, run, check and fix in a loop" },
    { uc: "High-volume feature inside a product", go: ["T7"], add: ["T3", "T4"], why: "Latency, cost and data residency" },
    { uc: "Quick win for a Databricks or Snowflake team", go: ["T9"], add: ["T2", "T4"], why: "Fastest to get going; our assets plug straight in" },
    { uc: "Prototype or small app", go: ["T1"], add: ["T2"], why: "Minimal effort, fine at small scale" }
  ],

  questionSets: [
    { icon: "🥇", title: "Our own golden set", d: "200–500 real business questions with verified SQL and expected results, tagged by difficulty (single table, joins, metrics, vague, multi-step) and by domain." },
    { icon: "🌍", title: "Public benchmarks", d: "Spider (the clean one), BIRD (messy values, outside knowledge) and Spider 2.0 (big enterprise schemas and dialects), to compare with the outside world.", link: "#datasets" },
    { icon: "🙅", title: "A \"should say no\" set", d: "Questions it should refuse or ask about: out of scope, PII, can't be answered." }
  ],

  metrics: [
    { m: "Execution accuracy", d: "Does the result match the expected answer?", main: true },
    { m: "Schema-linking recall", d: "Did we find the tables and columns the question needs?" },
    { m: "Valid SQL rate", d: "Does the query parse and run?" },
    { m: "Correct \"no\" / clarify rate", d: "Does it ask or decline instead of guessing?" },
    { m: "Latency (p50 / p95)", d: "How long from question to answer?" },
    { m: "Cost per question", d: "LLM tokens plus warehouse compute" },
    { m: "Upkeep effort", d: "Hours a month to keep metadata, examples and ontology fresh" }
  ],

  datasets: [
    // Benchmarks
    { cat: "benchmark", name: "Spider 1.0", tag: "Clean, cross-domain", d: "The classic academic benchmark: ~10k questions over 200 databases. Tidy schemas; a good sanity check.", url: "https://yale-lily.github.io/spider", extra: [["Paper", "https://arxiv.org/abs/1809.08887"]] },
    { cat: "benchmark", name: "BIRD", tag: "Messy values, outside knowledge", d: "Large, realistic databases with dirty values and questions that need external knowledge. Closer to our reality.", url: "https://bird-bench.github.io/", extra: [["Paper", "https://arxiv.org/abs/2305.03111"]] },
    { cat: "benchmark", name: "Spider 2.0", tag: "Enterprise schemas & dialects", d: "Enterprise-scale workflows over BigQuery, Snowflake and more, with huge schemas and real dialects. The hardest of the three.", url: "https://spider2-sql.github.io/", extra: [["GitHub", "https://github.com/xlang-ai/Spider2"], ["Paper", "https://arxiv.org/abs/2411.07763"]] },
    { cat: "benchmark", name: "WikiSQL", tag: "Single table, historical", d: "Early large-scale dataset of single-table questions. Useful mainly for history and quick smoke tests.", url: "https://github.com/salesforce/WikiSQL" },
    { cat: "conversational", name: "SParC", tag: "Multi-turn", d: "Context-dependent, multi-turn version of Spider: follow-up questions that build on earlier ones.", url: "https://yale-lily.github.io/sparc" },
    { cat: "conversational", name: "CoSQL", tag: "Dialogue + clarification", d: "Conversational text-to-SQL including clarifying questions, handy for the \"should ask\" behaviour.", url: "https://yale-lily.github.io/cosql" },
    // Sample warehouses
    { cat: "warehouse", name: "TPC-H", tag: "Retail / supply chain", d: "Standard decision-support schema (orders, lineitem, customer…). Scales to any size; built into many engines.", url: "https://www.tpc.org/tpch/" },
    { cat: "warehouse", name: "TPC-DS", tag: "Retail star schema, 24 tables", d: "Richer multi-channel retail warehouse with many fact and dimension tables: good for the 50+ table scenario.", url: "https://www.tpc.org/tpcds/" },
    { cat: "warehouse", name: "Databricks sample datasets", tag: "samples catalog", d: "TPC-H, NYC taxi and more, available in every Databricks workspace. Zero setup for T2, T3 and T9 experiments.", url: "https://docs.databricks.com/en/discover/databricks-datasets.html" },
    { cat: "warehouse", name: "Snowflake sample data", tag: "SNOWFLAKE_SAMPLE_DATA", d: "Shared TPC-H and TPC-DS databases in every Snowflake account. Handy for Cortex Analyst comparisons.", url: "https://docs.snowflake.com/en/user-guide/sample-data" },
    { cat: "warehouse", name: "dbt Jaffle Shop", tag: "dbt project", d: "dbt's demo shop project with models and semantic definitions: a ready-made starting point for T3.", url: "https://github.com/dbt-labs/jaffle-shop" },
    { cat: "warehouse", name: "AdventureWorks", tag: "Manufacturing / sales OLTP + DW", d: "Microsoft's sample with cryptic-ish names across many schemas: realistic for metadata enrichment.", url: "https://learn.microsoft.com/en-us/sql/samples/adventureworks-install-configure" },
    { cat: "warehouse", name: "Chinook", tag: "Small, multi-dialect", d: "Digital music store. Scripts for many engines make it great for dialect tests and T1 baselines.", url: "https://github.com/lerocha/chinook-database" },
    { cat: "warehouse", name: "Pagila", tag: "Postgres DVD rental", d: "Postgres port of the Sakila sample. Good for local runs alongside pgvector (T5, T8).", url: "https://github.com/devrimgunduz/pagila" }
  ],

  resources: [
    { t: ["T2", "T5"], kind: "Catalog", name: "Unity Catalog", d: "Table/column comments and tags as the home for curated metadata.", url: "https://www.unitycatalog.io/" },
    { t: ["T3"], kind: "Semantic layer", name: "dbt Semantic Layer", d: "Define metrics once in dbt (MetricFlow), query them anywhere.", url: "https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl" },
    { t: ["T3"], kind: "Semantic layer", name: "Cube", d: "Open-source semantic layer with SQL and REST APIs.", url: "https://cube.dev/" },
    { t: ["T3"], kind: "Semantic layer", name: "LookML", d: "Looker's modeling language for dimensions, measures and joins.", url: "https://cloud.google.com/looker/docs/what-is-lookml" },
    { t: ["T3"], kind: "Semantic layer", name: "Databricks metric views", d: "Governed metrics defined in YAML and registered in Unity Catalog.", url: "https://docs.databricks.com/en/metric-views/index.html" },
    { t: ["T4", "T5"], kind: "Open source", name: "Vanna", d: "RAG-based text-to-SQL that retrieves DDL, docs and example SQL.", url: "https://github.com/vanna-ai/vanna" },
    { t: ["T5", "T8"], kind: "Open source", name: "pgvector", d: "Vector similarity search inside Postgres for metadata and value indexes.", url: "https://github.com/pgvector/pgvector" },
    { t: ["T6"], kind: "Open source", name: "SQLGlot", d: "SQL parser and transpiler: validate, lint and translate between dialects.", url: "https://github.com/tobymao/sqlglot" },
    { t: ["T7"], kind: "Model", name: "Defog SQLCoder", d: "Open models fine-tuned for text-to-SQL; a reference point for T7.", url: "https://github.com/defog-ai/sqlcoder" },
    { t: ["T8"], kind: "Open source", name: "NVIDIA Auto Ontology", d: "Generate → certify → answer. Postgres + pgvector, MCP server, REST API and CLI.", url: "https://github.com/NVIDIA/auto-ontology" },
    { t: ["T9"], kind: "Platform", name: "Databricks Genie", d: "Natural-language data agents configured with instructions, example SQL and trusted assets.", url: "https://docs.databricks.com/en/genie/index.html" },
    { t: ["T9"], kind: "Platform", name: "Snowflake Cortex Analyst", d: "Text-to-SQL over semantic models/views in Snowflake.", url: "https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst" },
    { t: ["eval"], kind: "Evaluation", name: "MLflow", d: "Experiment tracking and GenAI evaluation, including LLM-as-judge scorers.", url: "https://mlflow.org/" },
    { t: ["T4", "T5"], kind: "Paper", name: "DAIL-SQL", d: "Systematic study of prompt and example selection for LLM text-to-SQL.", url: "https://arxiv.org/abs/2308.15363" },
    { t: ["T6"], kind: "Paper", name: "DIN-SQL", d: "Decomposed in-context learning with self-correction.", url: "https://arxiv.org/abs/2304.11015" },
    { t: ["T5", "T6"], kind: "Paper", name: "CHESS", d: "Contextual harnessing: entity/value retrieval, schema selection and candidate generation.", url: "https://arxiv.org/abs/2405.16755" },
    { t: ["T6"], kind: "Paper", name: "MAC-SQL", d: "Multi-agent framework: decomposer, selector and refiner agents.", url: "https://arxiv.org/abs/2312.11242" },
    { t: ["eval"], kind: "Survey", name: "LLM-based Text-to-SQL survey", d: "Broad overview of techniques, datasets and evaluation.", url: "https://arxiv.org/abs/2406.08426" }
  ],

  tree: [
    ["text2sql-coe/", ""],
    ["  shared/", ""],
    ["    sample_data/", "synthetic retail/finance warehouse, 50+ tables"],
    ["    golden_set/", "questions, verified SQL, expected results"],
    ["    eval_harness/", "metrics, CI runner, leaderboard"],
    ["    guardrails/", "read-only exec, cost limits, PII masking, audit log"],
    ["    llm_clients/", "model-agnostic LLM + embedding wrappers"],
    ["  techniques/", ""],
    ["    t1_baseline/", "", "T1"],
    ["    t2_metadata_enrichment/", "", "T2"],
    ["    t3_semantic_layer/", "", "T3"],
    ["    t4_fewshot_examples/", "", "T4"],
    ["    t5_schema_linking/", "", "T5"],
    ["    t6_agentic_correction/", "", "T6"],
    ["    t7_finetuning/", "", "T7"],
    ["    t8_ontology_auto_ontology/", "", "T8"],
    ["    t9_platform_native/", "", "T9"],
    ["  playbooks/", "decision guide, onboarding, lessons learned"]
  ],

  risks: [
    { r: "Silent wrong answers make people stop trusting it", m: "Show the SQL and assumptions with every answer; use certified assets for KPIs; say \"not sure\" instead of guessing" },
    { r: "Data leaks or PII exposure", m: "Run queries as the user; inherit row/column security; mask PII; keep an audit log" },
    { r: "Warehouse or LLM bills get out of hand", m: "Cost and row limits, caching, and cost per question tracked in the harness" },
    { r: "Metadata and examples go stale", m: "Metadata pipelines in CI; golden set re-runs on schema changes" },
    { r: "Domain experts are busy", m: "Start with a small golden set; let an LLM draft metadata so experts just review" },
    { r: "The tool landscape moves fast", m: "Model-agnostic clients; test platform tools in the same harness" }
  ],

  demos: [
    {
      q: "How did revenue in the West region do last quarter?",
      sql: "SELECT r.region_name,\n       SUM(o.net_amount) AS revenue\nFROM   fct_orders o\nJOIN   dim_region r ON o.region_id = r.region_id\nWHERE  r.region_name = 'West'\n  AND  o.is_test_account = FALSE\n  AND  o.booked_date >= DATE '2026-07-01'\n  AND  o.booked_date <  DATE '2026-10-01'\nGROUP  BY r.region_name;",
      foot: ["T3 metric: revenue (net of refunds)", "T5 linked: fct_orders, dim_region", "T6 dry run ✓"]
    },
    {
      q: "Top 5 active customers in California by orders this year",
      sql: "SELECT c.customer_name,\n       COUNT(*) AS orders\nFROM   fct_orders o\nJOIN   dim_customer c ON o.customer_id = c.customer_id\nWHERE  c.cust_stat_cd = 'A'      -- active\n  AND  c.state = 'CA'            -- \"California\"\n  AND  o.booked_date >= DATE '2026-01-01'\nGROUP  BY c.customer_name\nORDER  BY orders DESC\nLIMIT  5;",
      foot: ["T2 metadata: cust_stat_cd 'A' = active", "T5 value index: California → 'CA'", "T4 similar example ×2"]
    }
  ]
};
