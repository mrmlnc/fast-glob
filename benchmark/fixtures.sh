#!/bin/bash

pwd=$PWD
tmp=${TMPDIR:-/tmp}
fixtures=$tmp/fast-glob-benchmark-fixtures

echo Making benchmark fixtures

# Should skip this step?
if [ -d $fixtures ]; then
	echo Files already exist
	exit 0
fi

# Create 10 files
echo Create 10 files
mkdir $fixtures $fixtures/10
cd $fixtures/10
touch {0..4}.txt
touch {0..4}.md
cd $fixtures

# Create n files
#
# $1 - source
# $2 - dest
# $3 - n
function make_fixtures {
	echo Create $2 files
	cp -R $fixtures/$1 $fixtures/$2
	for (( i = 0; i < $3 - 1; i++ )); do
		cp -R $fixtures/$1 $fixtures/$2/$1-$i
	done
}

# Create other files
make_fixtures 10 50 5 # 50 files
make_fixtures 10 100 10 # 100 files
make_fixtures 100 500 5 # 500 files
make_fixtures 500 1000 2 # 1000 files
make_fixtures 1000 5000 5 # 5000 files
make_fixtures 5000 10000 2 # 10000 files
