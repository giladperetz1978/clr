#!/usr/bin/env bash
set -Eeuo pipefail

CREDENTIAL='/etc/credstore.encrypted/caloritrack-gemini-api-key'

if [[ "${EUID}" -ne 0 ]]; then
  echo 'Run through SSH as root.' >&2
  exit 1
fi
if [[ ! -t 0 ]]; then
  echo 'This command needs an interactive terminal (use ssh -t).' >&2
  exit 1
fi
if [[ ! -f /etc/credstore.encrypted/caloritrack-backup-encryption-key ]]; then
  echo 'Run server setup before provisioning the Gemini credential.' >&2
  exit 1
fi

read -r -s -p 'Gemini API key (input is hidden): ' GEMINI_API_KEY
printf '\n'
if [[ -z "${GEMINI_API_KEY}" ]]; then
  echo 'No key was entered; nothing changed.' >&2
  exit 1
fi
if [[ "${GEMINI_API_KEY}" == *$'\n'* || "${GEMINI_API_KEY}" == *$'\r'* ]]; then
  unset GEMINI_API_KEY
  echo 'The key contains an invalid line break.' >&2
  exit 1
fi

printf '%s' "${GEMINI_API_KEY}" |
  systemd-creds encrypt --with-key=host --name=gemini-api-key - "${CREDENTIAL}"
unset GEMINI_API_KEY
chown root:root "${CREDENTIAL}"
chmod 0600 "${CREDENTIAL}"
systemctl restart caloritrack.service
systemctl --no-pager --quiet is-active caloritrack.service
echo 'Gemini credential encrypted and stored. CaloriTrack service is active.'
