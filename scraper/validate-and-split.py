#!/usr/bin/env python
# coding: utf-8

import time
import urllib.request

input("Press Enter to continue...")

outrows = []

for line in open('all-journals.txt', 'r'):
    line = line.rstrip()
    print(line)

    valid = True

    # Check
    # FIXME
    # failed = True
    # while failed:
    #     try:
    #         b = urllib.request.urlopen("http://{}.access.library.miami.edu/".format(line))
    #         failed = False
    #     except IOError:
    #         print("Failure! %s" % line)
    #         time.sleep(0.1)
    # import pdb; pdb.set_trace()
    # if (b.getcode() != 200 or b.geturl()):
    #     valid = False

    # Write output
    if valid:
        outrows.append(line)
    else:
        print("Error: No access to {}",format(line))

    time.sleep(0.05)

with open('valid.txt', 'w') as validf:
    validf.write('\n'.join(outrows))