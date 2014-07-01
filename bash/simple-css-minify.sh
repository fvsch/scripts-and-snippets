#!/bin/bash
# Simple script to concatenate a specified list of CSS files
# and remove CSS comments (for a bit less weight and a bit more opacity).
# If you want a more complete solution, look at build systems,
# CSS compressors (such as YUI-Compressor), CSS pre-processors, etc.

FINAL="all.min.css"
SOURCES=(
	"base.css"
	"global.css"
	"home.css"
	"something.css"
)

rm $FINAL;
touch $FINAL;

for s in ${SOURCES[*]}
do
	echo "Processing " $s;
	# Not sure how robust this is...
	sed -e 's@/\*.*\*/@@g' -e '/\/\*/,/\*\//d' -e '/^$/d' $s >> $FINAL;
done

echo "Done."
