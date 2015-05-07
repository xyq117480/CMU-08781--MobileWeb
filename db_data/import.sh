#!/bin/bash
mongoimport --db mean-dev -c users db_data/user_export.json
mongoimport --db mean-dev -c places db_data/place_export.json
mongoimport --db mean-dev -c usermeets db_data/usermeet_export.json
mongoimport --db mean-dev -c meets db_data/meet_export.json
