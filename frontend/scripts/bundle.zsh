dist="dist-web"

repo_dir=$(git rev-parse --show-toplevel)
# Copy web images
images="$repo_dir/data/column-images"
rsync -av --delete "$images/" "$dist/section-images/"

# Copy geologic patterns and symbols
patterns=app/node_modules/geologic-patterns/assets/png
rsync -av --delete "$patterns/" "$dist/lithology-patterns/"
rsync -av --delete "assets/column-patterns/" "$dist/column-symbols/"

# scripts/serialize-queries
nodemon & webpack --watch
