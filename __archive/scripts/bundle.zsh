dist="dist-web"

scripts/link-data.zsh

# Copy geologic patterns and symbols
patterns=app/node_modules/geologic-patterns/assets/png
rsync -av --delete "$patterns/" "$dist/lithology-patterns/"
rsync -av --delete "assets/column-patterns/" "$dist/column-symbols/"

# scripts/serialize-queries
# Concurrent running is'nt working quite right
webpack --watch
