'use client'

import {GenericHeader} from "@/components/generics/GenericHeader";
import {useSearchParams} from "next/navigation"; // useRouter hook should be imported from next/navigation
import React, {useEffect, useRef, useState} from "react";
import {Button, Grid} from "@mui/material";
import seedrandom from "seedrandom";

export default function CAAPage() {

    // get data
    const [decisionMakerData, setDecisionMakerData] = useState<{ [dmId: string]: any }>({});
    const searchParams = useSearchParams()

    // State to hold aggregated preferences
    const [aggregatedPreferences, setAggregatedPreferences] = useState<AggregatedPreference[]>([]);


    // Fetch and parse data from URL params
    useEffect(() => {

        // newData[dmId] = {
        //   criteria: parsedData.criteria || "default criteria",
        //   weights: parsedData.weights || [],
        //   alt1 ... altn // other processed data
        // };

        const newData: { [dmId: string]: any } = {};

        // multiple dmIds or a single dmId parameter with multiple values
        /* example data:
        * inputcaa?data={"1"%3A[{"id"%3A0%2C"criteria"%3A"criterion 1"%2C"weight"%3A1%2C"alt1"%3A2%2C"alt2"%3A5%2C"alt3"%3A1}%2C{"id"%3A1%2C"criteria"%3A"criterion 2"%2C"weight"%3A5%2C"alt1"%3A3%2C"alt2"%3A4%2C"alt3"%3A2}%2C{"id"%3A2%2C"criteria"%3A"criterion 3"%2C"weight"%3A2%2C"alt1"%3A4%2C"alt2"%3A3%2C"alt3"%3A3}%2C{"id"%3A1000%2C"criteria"%3A"weighted sum"%2C"alt1"%3A25%2C"alt2"%3A31%2C"alt3"%3A17%2C"alt4"%3A0%2C"alt5"%3A0}%2C{"id"%3A1001%2C"criteria"%3A"rank"%2C"alt1"%3A2%2C"alt2"%3A1%2C"alt3"%3A3%2C"alt4"%3A4%2C"alt5"%3A4}]%2C"2"%3A[{"id"%3A0%2C"criteria"%3A"criterion 1"%2C"weight"%3A4%2C"alt1"%3A5%2C"alt2"%3A1%2C"alt3"%3A3}%2C{"id"%3A1%2C"criteria"%3A"criterion 2"%2C"weight"%3A2%2C"alt1"%3A1%2C"alt2"%3A2%2C"alt3"%3A2}%2C{"id"%3A2%2C"criteria"%3A"criterion 3"%2C"weight"%3A3%2C"alt1"%3A2%2C"alt2"%3A5%2C"alt3"%3A1}%2C{"id"%3A1000%2C"criteria"%3A"weighted sum"%2C"alt1"%3A28%2C"alt2"%3A23%2C"alt3"%3A19%2C"alt4"%3A0%2C"alt5"%3A0}%2C{"id"%3A1001%2C"criteria"%3A"rank"%2C"alt1"%3A1%2C"alt2"%3A2%2C"alt3"%3A3%2C"alt4"%3A4%2C"alt5"%3A4}]}
        * */
        searchParams.forEach((value, key) => {
            try {
                // Decode the URL-encoded string
                const decodedString = decodeURIComponent(value);
                // Parse the JSON string
                const parsedData = JSON.parse(decodedString);

                // Use the key as dmId, or if you expect a different structure, adjust accordingly
                const dmId = key;

                // Generate data object for this dmId
                newData[dmId] = parsedData;

            } catch (error) {
                console.error(`Error parsing data for ${key}:`, error);
            }
        });

        console.log('Generated Data:', newData);
        setDecisionMakerData(newData);
    }, [searchParams]);

    /* example data object:
 {
  "data": {
    "1": [
      {
        "id": 0,
        "criteria": "criterion 1",
        "weight": 1,
        "alt1": 2,
        "alt2": 5,
        "alt3": 1
      },
      {
        "id": 1,
        "criteria": "criterion 2",
        "weight": 5,
        "alt1": 3,
        "alt2": 4,
        "alt3": 2
      },
      {
        "id": 2,
        "criteria": "criterion 3",
        "weight": 2,
        "alt1": 4,
        "alt2": 3,
        "alt3": 3
      },
      {
        "id": 1000,
        "criteria": "weighted sum",
        "alt1": 25,
        "alt2": 31,
        "alt3": 17,
        "alt4": 0,
        "alt5": 0
      },
      {
        "id": 1001,
        "criteria": "rank",
        "alt1": 2,
        "alt2": 1,
        "alt3": 3,
        "alt4": 4,
        "alt5": 4
      }
    ],
    "2": [
      {
        "id": 0,
        "criteria": "criterion 1",
        "weight": 4,
        "alt1": 5,
        "alt2": 1,
        "alt3": 3
      },
      {
        "id": 1,
        "criteria": "criterion 2",
        "weight": 2,
        "alt1": 1,
        "alt2": 2,
        "alt3": 2
      },
      {
        "id": 2,
        "criteria": "criterion 3",
        "weight": 3,
        "alt1": 2,
        "alt2": 5,
        "alt3": 1
      },
      {
        "id": 1000,
        "criteria": "weighted sum",
        "alt1": 28,
        "alt2": 23,
        "alt3": 19,
        "alt4": 0,
        "alt5": 0
      },
      {
        "id": 1001,
        "criteria": "rank",
        "alt1": 1,
        "alt2": 2,
        "alt3": 3,
        "alt4": 4,
        "alt5": 4
      }
    ]
  }
}
    * */


    //function that generates aggregation of decisionMakerData
    // Run aggregation whenever decisionMakerData updates
    useEffect(() => {
        const aggPrefs = aggPreferences(decisionMakerData);
        setAggregatedPreferences(aggPrefs);
        console.log('Aggregated Preferences:', aggPrefs);
    }, [decisionMakerData]);


    interface AggregatedPreference {
        criteria: string;
        weights: Set<number>;
    }

    //interface row object
    interface Row {
        id: number;
        criteria: string;
        weight: number | undefined;

        [p: string]: any;
    }

    const aggPreferences = (data: { [dmId: string]: any }): AggregatedPreference[] => {
        let aggPreferences: AggregatedPreference[] = [];

        // check if data isEmpty - should have 1 object containing arrays of decision maker data
        const dmData = Object.values(data);
        console.log('Decision Makers:', dmData);

        // error handling
        if (dmData.length === 0) {
            return aggPreferences;
        }

        // Extract criteria keys
        // from the first decision maker
        const firstDM = dmData[0][1]; // first array of object
        console.log('First DM:', firstDM);
        /* firstDM example data:
         [
          {
            "id": 0,
            "criteria": "criterion 1",
            "weight": 1,
            "alt1": 2,
            "alt2": 5,
            "alt3": 1
          },
          {
            "id": 1,
            "criteria": "criterion 2",
            "weight": 5,
            "alt1": 3,
            "alt2": 4,
            "alt3": 2
          },
          {
            "id": 2,
            "criteria": "criterion 3",
            "weight": 2,
            "alt1": 4,
            "alt2": 3,
            "alt3": 3
          },
          {
            "id": 1000,
            "criteria": "weighted sum",
            "alt1": 25,
            "alt2": 31,
            "alt3": 17,
            "alt4": 0,
            "alt5": 0
          },
          {
            "id": 1001,
            "criteria": "rank",
            "alt1": 2,
            "alt2": 1,
            "alt3": 3,
            "alt4": 4,
            "alt5": 4
          }
        ]
        */
        const criteriaSet = new Set<string>(); // Set has unique values
        firstDM.forEach((object: Row) => {
            if (object.id !== 1000 && object.id !== 1001) {
                criteriaSet.add(object.criteria);
            }

        })

        // Initialize aggPreferences
        criteriaSet.forEach((criterion: string) => {
            aggPreferences.push({
                criteria: criterion,
                weights: new Set<number>
            });
        });

        // For each decision maker, gather weights
        const decisionMakers = dmData[0]; // contains an object array for each decision maker

        for (const dmID of Object.keys(decisionMakers)) {
            //const decisionMaker: Row[] = decisionMakers.x;
            const decisionMaker = decisionMakers[dmID];

            // set weight for each criterion

            for (let row = 0; row < aggPreferences.length; row++) {
                const decisionRow = decisionMaker[row];
                if (!decisionRow) continue; // Skip if decisionRow is undefined or null

                if (
                    aggPreferences[row].criteria === decisionRow.criteria &&
                    typeof decisionRow.weight === 'number'
                ) {
                    aggPreferences[row].weights.add(decisionRow.weight);
                }
            }

        }


        return aggPreferences;
        /*
         should be:
         [
          {
            "criteria": "criterion 1",
            "weights": [1,4]
          },      {
            "criteria": "criterion 2",
            "weights": [5,2]
          },
          {
            "criteria": "criterion 3",
            "weights": [2,3]
          }
        ]
        */
    }

    // todo: aggJudgementMatrix .. Matrix for each altn an array of unique values from decisionMaker judgements for each criterion m (is the mth index of altn array)


    const rngRef = useRef<seedrandom.PRNG | null>(null);

    // Initialize the seedrandom generator once
    const initializeGenerator = () => {
        rngRef.current = seedrandom('1234');
    };

    // Generate a random number between 0 and 1
    const getRandomNumber = () => {
        if (rngRef.current) {
            return rngRef.current();
        }
        return null;
    };

    React.useEffect(() => {
        initializeGenerator();
        console.log('Random number:', getRandomNumber());
    }, []);

    return (
        <Grid>
            <GenericHeader title={'Schritt 2: Combinatorial Acceptability Analysis'}/>
            <Grid>
                <Button onClick={() => {
                    initializeGenerator();
                    alert(`New seed random number: ${getRandomNumber()}`);
                }} variant={"contained"}>random</Button>
            </Grid>
        </Grid>
    )
}