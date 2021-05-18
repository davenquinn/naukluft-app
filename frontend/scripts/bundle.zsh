dist="dist-web"

repo_dir=$(git rev-parse --show-toplevel)
# Copy web images
images="$repo_dir/data/column-images"
image_dist="$dist/section-images"
rm -f "$image_dist"
ln -s "$images" "$image_dist"

# Copy geologic patterns and symbols
patterns=app/node_modules/geologic-patterns/assets/png
rsync -av --delete "$patterns/" "$dist/lithology-patterns/"
rsync -av --delete "assets/column-patterns/" "$dist/column-symbols/"

# scripts/serialize-queries
(cd ../api && nodemon) & webpack --watch
