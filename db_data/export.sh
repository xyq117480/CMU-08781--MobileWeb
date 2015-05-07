#!/bin/bash
mongoexport --db mean-dev -c users -o db_data/user_export.json
mongoexport --db mean-dev -c places -o db_data/place_export.json
mongoexport --db mean-dev -c usermeets -o db_data/usermeet_export.json
mongoexport --db mean-dev -c meets -o db_data/meet_export.json
