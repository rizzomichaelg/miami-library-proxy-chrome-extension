#!/bin/bash
# Sort & uniq, just in case.
sort -u valid.txt -o valid.txt

echo -n "var journals = {'" > ../javascript/journals.js
cat valid.txt | sort | uniq | tr "\n" "," | sed "s/,/':1,'/g" | sed 's/.\{2\}$//' | sed 's/\(.*\)/\1};/' >> ../javascript/journals.js
# echo "};" >> ../javascript/journals.js

# Final structure should look like:
#var intersect_journals = {'url':1,'url':1,...};