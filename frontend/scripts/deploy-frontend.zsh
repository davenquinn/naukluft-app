dist="dist-web"

repo_dir=$(git rev-parse --show-toplevel)
# Copy web images
images="$repo_dir/data/column-images"
image_dist="$dist/section-images"
rm -f "$image_dist"
ln -s "$images" "$image_dist"

# Copy geologic patterns and symbols
patterns=app/node_modules/geologic-patterns/assets/png
rsync -av "$patterns/" "$dist/lithology-patterns/"
rsync -av "assets/column-patterns/" "$dist/column-symbols/"

export NODE_ENV=production
export PUBLIC_PATH="https://dev.macrostrat.org/naukluft"
webpack

rsync -azv --delete "$dist/" steno:/data/projects/macrostrat/naukluft/
