#!/bin/bash

for i in {1..8}; do
    cp modern-1.csv modern-$i.csv
    cp modern-1.csv international-$i.csv
done
