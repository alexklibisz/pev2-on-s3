#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLANS_DIR="$SCRIPT_DIR/plans"
QUERIES_DIR="$SCRIPT_DIR/queries"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-postgres}"
PGDATABASE="${PGDATABASE:-pev2_examples}"

export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE

echo "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
  if pg_isready -q 2>/dev/null; then
    echo "PostgreSQL is ready."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: PostgreSQL did not become ready in time." >&2
    exit 1
  fi
  sleep 1
done

mkdir -p "$PLANS_DIR"

for query_file in "$QUERIES_DIR"/*.sql; do
  name="$(basename "$query_file" .sql)"
  echo "Generating plan for $name..."

  # Extract title from the first-line comment
  title="$(head -1 "$query_file" | sed 's/^-- *//')"

  # Read the query text
  query="$(cat "$query_file")"

  # Run EXPLAIN and capture JSON output
  plan_json="$(psql -X -A -t -c "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) $(cat "$query_file")")"

  # Build the artifact JSON using jq
  jq -n \
    --arg title "$title" \
    --arg query "$query" \
    --arg plan "$plan_json" \
    '{ title: $title, query: $query, plan: $plan }' \
    > "$PLANS_DIR/$name.json"

  echo "  -> $PLANS_DIR/$name.json"
done

echo "Done. Generated $(ls "$PLANS_DIR"/*.json | wc -l | tr -d ' ') plan(s)."
