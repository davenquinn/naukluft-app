dist="dist-web"

scripts/link-data.zsh

# Copy geologic patterns and symbols
patterns=packages/geologic-patterns/assets/png
rsync -av "$patterns/" "$dist/lithology-patterns/"
rsync -av "assets/column-patterns/" "$dist/column-symbols/"

export NODE_ENV=production
export PUBLIC_PATH="/naukluft/"
export NAUKLUFT_API_BASE_URL="https://dev.macrostrat.org/naukluft/api"
webpack

# Rclone to S3
rclone sync --copy-links --progress \
  $dist/ macrostrat-s3:macrostrat-sites/naukluft/
