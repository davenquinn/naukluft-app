# Copy web images
repo_dir=$(git rev-parse --show-toplevel)
dist="dist-web"

images="$repo_dir/data/column-images"
image_dist="$dist/section-images"
rm -f "$image_dist"
ln -s "$images" "$image_dist"

tileset_dir="$dist/tilesets"

if [ ! -e "$tileset_dir" ]; then
  ln -s "$repo_dir/data/tilesets" "$tileset_dir"
fi