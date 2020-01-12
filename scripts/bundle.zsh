mkdir -p dist-web
scripts/serialize-queries
webpack --watch $@
