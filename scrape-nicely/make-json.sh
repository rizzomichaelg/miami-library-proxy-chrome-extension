#!/bin/bash

# Input: BECKER.txt, DANFORTH.txt
#  Intermediates: BECKER-UNIQUE.txt, INTERSECT.txt, DANFORTH-UNIQUE.txt
# Output: becker-journals.js, intersect-journals.js, danforth-journals.js

# Add in the whitelists
cat INTERSECT-WHITELIST.txt >> BECKER.txt
cat INTERSECT-WHITELIST.txt >> DANFORTH.txt
cat BECKER-WHITELIST.txt >> BECKER.txt
cat DANFORTH-WHITELIST.txt >> DANFORTH.txt

# Sort post intersect
sort BECKER.txt -o BECKER.txt
sort DANFORTH.txt -o DANFORTH.txt

grep -Fx -f DANFORTH.txt BECKER.txt | grep -v -f BLACKLIST.txt | uniq > INTERSECT.txt
grep -Fxv -f DANFORTH.txt BECKER.txt | grep -v -f BLACKLIST.txt | uniq > BECKER-UNIQUE.txt
grep -Fxv -f BECKER.txt DANFORTH.txt | grep -v -f BLACKLIST.txt | uniq > DANFORTH-UNIQUE.txt


echo -n "var intersect_journals = {
    \"list\": ['" > ../journals.js
cat INTERSECT.txt | sort | uniq | tr "\n" "," | sed "s/,/','/g" | head -c-2 >> ../journals.js
echo "]
};" >> ../journals.js


echo -n "var becker_journals = {
    \"list\": ['" >> ../journals.js
cat BECKER-UNIQUE.txt | sort | uniq | tr "\n" "," | sed "s/,/','/g" | head -c-2 >> ../journals.js
echo "]
};" >> ../journals.js


echo -n "var danforth_journals = {
    \"list\": ['" >> ../journals.js
cat DANFORTH-UNIQUE.txt | sort | uniq | tr "\n" "," | sed "s/,/','/g" | head -c-2 >> ../journals.js
echo "]
};" >> ../journals.js


# Final structure should look like:
#var intersect_journals = {
#    "list": []
#};