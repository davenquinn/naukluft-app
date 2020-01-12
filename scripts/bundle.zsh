dist="dist-web"

# Copy web images
sections_dir="$dist/section-images"
mkdir -p $sections_dir
rsync -av --delete "$NAUKLUFT_DATA_DIR/Sections/Digitized Images/web-images/" "$sections_dir/"

scripts/serialize-queries
webpack --watch $@
