dist="dist-web"

scripts/link-data.zsh

# Copy geologic patterns and symbols
patterns=app/node_modules/geologic-patterns/assets/png
rsync -av "$patterns/" "$dist/lithology-patterns/"
rsync -av "assets/column-patterns/" "$dist/column-symbols/"

export NODE_ENV=production
export PUBLIC_PATH="/naukluft/"
export NAUKLUFT_API_BASE_URL="https://birdnest.geology.wisc.edu/naukluft-api"
webpack

# Rsync, following symlinks
rsync -azvLK --delete "$dist/" steno:/data/projects/macrostrat/naukluft/
