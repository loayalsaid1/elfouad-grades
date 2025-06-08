#!/bin/bash

for i in {1..8}; do
    cp sample.csv modern-$i.csv
    cp sample.csv international-$i.csv
done
