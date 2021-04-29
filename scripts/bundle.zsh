dist="dist-web"

# Copy web images
images="$NAUKLUFT_DATA_DIR/Sections/Digitized Images/web-images"
rsync -av --delete "$images/" "$dist/section-images/"

# Copy geologic patterns and symbols
patterns=app/node_modules/geologic-patterns/assets/png
rsync -av --delete "$patterns/" "$dist/lithology-patterns/"
rsync -av --delete "assets/column-patterns/" "$dist/column-symbols/"

scripts/serialize-queries
webpack --watch $@
