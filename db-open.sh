#!/bin/bash

# Thanks be to https://gist.github.com/helderco/e9d8d072a362ad818f6a, directly copped
set -e

show_help() {
cat << EOF
Usage: ${0##*/} [-u USER] [-p PASS] [-P PORT] [-H HOST] [DATABASE]
       ${0##*/} -h

Open a standard connection in Sequel PRO.

  -h          display this help and exit
  -u USER     database user (defaults to root)
  -p PASS     database password (defaults to root)
  -P PORT     database port (defaults to published port for 3306
                in db service with docker-compose)
  -H HOST     database host (defaults to your docker-machine host)
  DATABASE    database name (defaults to none)

EOF
}


while getopts :u:p:P:H:h opt; do
  case $opt in
    u) DB_USER="$OPTARG"
      ;;
    p) DB_PASS="$OPTARG"
      ;;
    P) DB_PORT="$OPTARG"
      ;;
    H) DB_HOST="$OPTARG"
      ;;
    h)
      show_help
      exit 0
      ;;
    \?)
      show_help >&2
      exit 1
      ;;
    :)
      show_help >&2
      exit 1
      ;;
  esac
done

shift "$((OPTIND-1))"

: ${DB_USER:=root}
: ${DB_PASS:=root}
: ${DB_PORT:=$(docker-compose port db 3306 | cut -d: -f2)}
: ${DB_HOST:=$(docker-machine ip $DOCKER_MACHINE_NAME)}
: ${DB_NAME:=$1}

TMP_SPF='/tmp/docker.spf'

cat > $TMP_SPF <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>ContentFilters</key>
    <dict/>
    <key>auto_connect</key>
    <true/>
    <key>data</key>
    <dict>
        <key>connection</key>
        <dict>
            <key>database</key>
            <string>${DB_NAME}</string>
            <key>host</key>
            <string>${DB_HOST}</string>
            <key>name</key>
            <string>docker.${DOCKER_MACHINE_NAME}</string>
            <key>password</key>
            <string>${DB_PASS}</string>
            <key>port</key>
            <integer>${DB_PORT}</integer>
            <key>rdbms_type</key>
            <string>mysql</string>
            <key>sslCACertFileLocation</key>
            <string></string>
            <key>sslCACertFileLocationEnabled</key>
            <integer>0</integer>
            <key>sslCertificateFileLocation</key>
            <string></string>
            <key>sslCertificateFileLocationEnabled</key>
            <integer>0</integer>
            <key>sslKeyFileLocation</key>
            <string></string>
            <key>sslKeyFileLocationEnabled</key>
            <integer>0</integer>
            <key>type</key>
            <string>SPTCPIPConnection</string>
            <key>useSSL</key>
            <integer>0</integer>
            <key>user</key>
            <string>${DB_USER}</string>
        </dict>
    </dict>
    <key>encrypted</key>
    <false/>
    <key>format</key>
    <string>connection</string>
    <key>queryFavorites</key>
    <array/>
    <key>queryHistory</key>
    <array/>
    <key>rdbms_type</key>
    <string>mysql</string>
    <key>rdbms_version</key>
    <string>5.5.44</string>
    <key>version</key>
    <integer>1</integer>
</dict>
</plist>
EOF

exec open $TMP_SPF