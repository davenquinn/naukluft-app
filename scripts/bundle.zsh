mkdir -p dist-web
cp index.web.html dist-web/index.html
webpack --watch $@
