# Fetch libraries
if [ ! -d "libs" ]; then
  mkdir -v libs
fi
if [ ! -f "libs/rdf2xml.jar" ]; then
  curl -L -k https://github.com/architolk/rdf2xml/releases/download/v1.2.1/rdf2xml.jar -o libs/rdf2xml.jar
fi

java -jar libs/rdf2xml.jar vocabulary.ttl examples/termdown/begrippen.md skos2td.xsl
