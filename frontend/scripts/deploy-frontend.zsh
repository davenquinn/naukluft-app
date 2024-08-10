dist="dist-web"

scripts/link-data.zsh

# Copy geologic patterns and symbols
patterns=packages/geologic-patterns/assets/png
rsync -av "$patterns/" "$dist/lithology-patterns/"
rsync -av "assets/column-patterns/" "$dist/column-symbols/"

export NODE_ENV=production
export BUCKET_NAME="macrostrat-storage:macrostrat-sites"
export PUBLIC_PATH="/"
export NAUKLUFT_API_BASE_URL="https://naukluft.svc.macrostrat.org/api"
webpack

# Rclone to S3
rclone sync --copy-links --progress $dist/ $BUCKET_NAME/naukluft/
